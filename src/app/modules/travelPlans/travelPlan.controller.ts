/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelPlanServices } from "./travelPlan.service";

const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await travelPlanServices.createTravelPlan(req.body, decoded);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Travel plan created successfully.",
    data: result,
  });
});

const getMyTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await travelPlanServices.getMyTravelPlans(decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My travel plans retrieved successfully.",
    data: result,
  });
});

const getPublicTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const result = await travelPlanServices.getPublicTravelPlans(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plans retrieved successfully.",
    data: result,
  });
});

const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  // optional auth: if you want private plan access, pass decoded when present
  const decoded = req.user as JwtPayload | undefined;
  const result = await travelPlanServices.getTravelPlanById(req.params.id, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan retrieved successfully.",
    data: result,
  });
});

const updateTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await travelPlanServices.updateTravelPlan(
    req.params.id,
    req.body,
    decoded
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan updated successfully.",
    data: result,
  });
});

const deleteTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await travelPlanServices.deleteTravelPlan(req.params.id, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan deleted successfully.",
    data: result,
  });
});

const matchTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload | undefined; // optional
  const result = await travelPlanServices.matchTravelPlans(req.query as any, decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Matched travel plans retrieved successfully.",
    data: result,
  });
});


export const travelPlanControllers = {
  createTravelPlan,
  getMyTravelPlans,
  getPublicTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  matchTravelPlans
};
