import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewServices } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await reviewServices.createReview(req.body, decoded);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully.",
    data: result,
  });
});

const getReviewsByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.getReviewsByUserId(req.params.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully.",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await reviewServices.updateReview(req.params.id, req.body, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully.",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await reviewServices.deleteReview(req.params.id, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully.",
    data: result,
  });
});

export const reviewControllers = {
  createReview,
  getReviewsByUserId,
  updateReview,
  deleteReview,
};
