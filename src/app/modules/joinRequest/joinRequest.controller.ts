import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { joinRequestServices } from "./joinRequest.service";

const createJoinRequest = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await joinRequestServices.createJoinRequest(req.body, decoded);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Join request created successfully.",
    data: result,
  });
});

const getIncomingRequests = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await joinRequestServices.getIncomingRequests(decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Incoming join requests retrieved successfully.",
    data: result,
  });
});

const getOutgoingRequests = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await joinRequestServices.getOutgoingRequests(decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Outgoing join requests retrieved successfully.",
    data: result,
  });
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await joinRequestServices.updateRequestStatus(
    req.params.id,
    req.body,
    decoded
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Join request status updated successfully.",
    data: result,
  });
});

const cancelRequest = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await joinRequestServices.cancelRequest(req.params.id, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Join request canceled successfully.",
    data: result,
  });
});

export const joinRequestControllers = {
  createJoinRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  cancelRequest,
};
