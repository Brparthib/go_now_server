/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { JoinRequest } from "../joinRequest/joinRequest.model";
import { JoinRequestStatus } from "../joinRequest/joinRequest.interface";
import { Review } from "./review.model";
import { IReview } from "./review.interface";
import { Types } from "mongoose";
import { PlanStatus } from "../travelPlans/travelPlan.interface";
import { TravelPlan } from "../travelPlans/travelPlan.model";

const assertUserActive = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked!!");
  }
  return user;
};

const isTripCompleted = (plan: any) => {
  if (plan.status === PlanStatus.COMPLETED) return true;
  const now = new Date();
  if (plan.endDate && new Date(plan.endDate) < now) return true;
  return false;
};

const assertReviewEligibility = async (
  planId: string,
  reviewerId: string,
  revieweeId: string
) => {
  if (reviewerId === revieweeId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot review yourself.");
  }

  const plan = await TravelPlan.findById(planId);
  if (!plan || plan.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found!!");
  }

  if (!isTripCompleted(plan)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can review only after the trip is completed."
    );
  }

  const hostId = String(plan.hostId);

  // Allowed relations (MVP):
  // 1) host reviews accepted requester
  // 2) accepted requester reviews host
  const reviewerIsHost = reviewerId === hostId;
  const revieweeIsHost = revieweeId === hostId;

  // helper: check accepted join request for user on plan
  const hasAccepted = async (userId: string) => {
    const req = await JoinRequest.findOne({
      planId: plan._id,
      requesterId: userId,
      status: JoinRequestStatus.ACCEPTED,
    });
    return !!req;
  };

  if (reviewerIsHost) {
    // host -> reviewee must be accepted requester
    const ok = await hasAccepted(revieweeId);
    if (!ok) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can review only accepted participants of your plan."
      );
    }
    return plan;
  }

  if (revieweeIsHost) {
    // requester -> host, requester must be accepted
    const ok = await hasAccepted(reviewerId);
    if (!ok) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only accepted participants can review the host."
      );
    }
    return plan;
  }

  // participant-to-participant reviews can be added later if you want
  throw new AppError(
    httpStatus.FORBIDDEN,
    "You can review only between host and accepted participant for this plan."
  );
};

const recalcUserRatingSummary = async (userId: string) => {
  const revieweeObjectId = new Types.ObjectId(userId);

  const agg = await Review.aggregate([
    {
      $match: {
        revieweeId: revieweeObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$revieweeId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = agg?.[0]
    ? { avg: Number(agg[0].avg.toFixed(2)), count: agg[0].count }
    : { avg: 0, count: 0 };

  await User.findByIdAndUpdate(
    userId,
    { ratingSummary: summary },
    { runValidators: true }
  );

  return summary;
};

const createReview = async (payload: any, decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);
  await assertUserActive(payload.revieweeId);

  // eligibility check
  await assertReviewEligibility(payload.planId, decoded.userId, payload.revieweeId);

  try {
    const created = await Review.create({
      planId: payload.planId,
      reviewerId: decoded.userId,
      revieweeId: payload.revieweeId,
      rating: payload.rating,
      comment: payload.comment,
      isDeleted: false,
    });

    // update rating summary of reviewee
    await recalcUserRatingSummary(payload.revieweeId);

    return created;
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You already reviewed this user for this trip."
      );
    }
    throw err;
  }
};

const getReviewsByUserId = async (userId: string) => {
  const reviews = await Review.find({
    revieweeId: userId,
    isDeleted: false,
  })
    .populate("reviewerId", "fullName imageUrl hasVerifiedBadge ratingSummary")
    .populate("planId", "destination startDate endDate travelType")
    .sort({ createdAt: -1 });

  return reviews;
};

const updateReview = async (
  reviewId: string,
  payload: Partial<IReview>,
  decoded: JwtPayload
) => {
  await assertUserActive(decoded.userId);

  const review = await Review.findById(reviewId);
  if (!review || review.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found!!");
  }

  if (String(review.reviewerId) !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  const updated = await Review.findByIdAndUpdate(reviewId, payload, {
    new: true,
    runValidators: true,
  });

  // rating might change → update summary
  await recalcUserRatingSummary(String(review.revieweeId));

  return updated;
};

const deleteReview = async (reviewId: string, decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  const review = await Review.findById(reviewId);
  if (!review || review.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found!!");
  }

  if (String(review.reviewerId) !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  await Review.findByIdAndUpdate(reviewId, { isDeleted: true });

  await recalcUserRatingSummary(String(review.revieweeId));

  return null;
};

export const reviewServices = {
  createReview,
  getReviewsByUserId,
  updateReview,
  deleteReview,
};
