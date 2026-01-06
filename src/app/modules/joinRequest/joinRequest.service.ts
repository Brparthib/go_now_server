/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { UserRole, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { TravelPlan } from "../travelPlans/travelPlan.model";
import { PlanStatus, PlanVisibility } from "../travelPlans/travelPlan.interface";
import { JoinRequest } from "./joinRequest.model";
import { JoinRequestStatus } from "./joinRequest.interface";

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

const assertPlanJoinable = async (planId: string) => {
  const plan = await TravelPlan.findById(planId);
  if (!plan || plan.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found!!");
  }

  if (plan.visibility !== PlanVisibility.PUBLIC) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot request a private plan.");
  }

  if (plan.status === PlanStatus.CANCELED || plan.status === PlanStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot request to join this plan.");
  }

  return plan;
};

const assertCapacityAvailable = async (planId: string, maxParticipants?: number) => {
  if (!maxParticipants) return; // unlimited

  // participants = host + accepted requests
  const acceptedCount = await JoinRequest.countDocuments({
    planId,
    status: JoinRequestStatus.ACCEPTED,
  });

  const totalParticipants = 1 + acceptedCount; // host included
  if (totalParticipants >= maxParticipants) {
    throw new AppError(httpStatus.BAD_REQUEST, "This travel plan is already full.");
  }
};

const createJoinRequest = async (
  payload: { planId: string; message?: string },
  decoded: JwtPayload
) => {
  await assertUserActive(decoded.userId);

  const plan = await assertPlanJoinable(payload.planId);

  const hostId = String(plan.hostId);

  // cannot request own plan
  if (hostId === decoded.userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot request your own plan.");
  }

  await assertCapacityAvailable(payload.planId, plan.maxParticipants);

  try {
    const reqDoc = await JoinRequest.create({
      planId: plan._id,
      hostId: plan.hostId,
      requesterId: decoded.userId,
      message: payload.message,
      status: JoinRequestStatus.PENDING,
    });

    return reqDoc;
  } catch (err: any) {
    // duplicate key from unique index => already requested
    if (err?.code === 11000) {
      throw new AppError(httpStatus.BAD_REQUEST, "You already requested to join this plan.");
    }
    throw err;
  }
};

const getIncomingRequests = async (decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  // incoming = hostId === me
  const list = await JoinRequest.find({ hostId: decoded.userId })
    .populate("planId", "destination startDate endDate travelType status visibility maxParticipants")
    .populate("requesterId", "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation")
    .sort({ createdAt: -1 });

  return list;
};

const getOutgoingRequests = async (decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  const list = await JoinRequest.find({ requesterId: decoded.userId })
    .populate("planId", "destination startDate endDate travelType status visibility maxParticipants")
    .populate("hostId", "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation")
    .sort({ createdAt: -1 });

  return list;
};

const updateRequestStatus = async (
  requestId: string,
  payload: { status: JoinRequestStatus.ACCEPTED | JoinRequestStatus.REJECTED },
  decoded: JwtPayload
) => {
  await assertUserActive(decoded.userId);

  const reqDoc = await JoinRequest.findById(requestId);
  if (!reqDoc) {
    throw new AppError(httpStatus.NOT_FOUND, "Join request not found!!");
  }

  const isAdmin = decoded.role === UserRole.ADMIN;
  const isHost = String(reqDoc.hostId) === decoded.userId;

  if (!isAdmin && !isHost) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  // only pending can be accepted/rejected
  if (reqDoc.status !== JoinRequestStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "This request is not pending anymore.");
  }

  // if accepting, check plan and capacity again
  if (payload.status === JoinRequestStatus.ACCEPTED) {
    const plan = await assertPlanJoinable(String(reqDoc.planId));
    await assertCapacityAvailable(String(reqDoc.planId), plan.maxParticipants);
  }

  reqDoc.status = payload.status;
  await reqDoc.save();

  const updated = await JoinRequest.findById(requestId)
    .populate("planId", "destination startDate endDate travelType status visibility maxParticipants")
    .populate("requesterId", "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation")
    .populate("hostId", "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation");

  return updated;
};

const cancelRequest = async (requestId: string, decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  const reqDoc = await JoinRequest.findById(requestId);
  if (!reqDoc) {
    throw new AppError(httpStatus.NOT_FOUND, "Join request not found!!");
  }

  const isAdmin = decoded.role === UserRole.ADMIN;
  const isRequester = String(reqDoc.requesterId) === decoded.userId;

  if (!isAdmin && !isRequester) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  if (reqDoc.status !== JoinRequestStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only pending requests can be canceled.");
  }

  reqDoc.status = JoinRequestStatus.CANCELED;
  await reqDoc.save();

  return null;
};

export const joinRequestServices = {
  createJoinRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  cancelRequest,
};
