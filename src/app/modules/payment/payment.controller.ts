import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentServices } from "./payment.service";
import AppError from "../../errorHelpers/AppError";

const initSubscription = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await paymentServices.initSubscription(decoded, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription payment initiated.",
    data: result,
  });
});

const initVerifiedBadge = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await paymentServices.initVerifiedBadge(decoded, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Verified badge payment initiated.",
    data: result,
  });
});

// SSLCommerz Redirect: success
const sslSuccess = catchAsync(async (req: Request, res: Response) => {
  const transactionId = String(req.query.transactionId || "");
  if (!transactionId) throw new AppError(httpStatus.BAD_REQUEST, "Missing transactionId");

  // SSL sends payload in req.body usually (POST), sometimes query; keep both
  const sslPayload = Object.keys(req.body || {}).length ? req.body : req.query;

  await paymentServices.processSuccess(transactionId, sslPayload);

  // Redirect user to frontend success page (recommended)
  // or send JSON for testing
  res.redirect(`${process.env.PAYMENT_SUCCESS_FRONTEND_URL}?transactionId=${transactionId}`);
});

const sslFail = catchAsync(async (req: Request, res: Response) => {
  const transactionId = String(req.query.transactionId || "");
  if (!transactionId) throw new AppError(httpStatus.BAD_REQUEST, "Missing transactionId");

  await paymentServices.processFail(transactionId, req.body || req.query);

  res.redirect(`${process.env.PAYMENT_FAIL_FRONTEND_URL}?transactionId=${transactionId}`);
});

const sslCancel = catchAsync(async (req: Request, res: Response) => {
  const transactionId = String(req.query.transactionId || "");
  if (!transactionId) throw new AppError(httpStatus.BAD_REQUEST, "Missing transactionId");

  await paymentServices.processCancel(transactionId, req.body || req.query);

  res.redirect(`${process.env.PAYMENT_CANCEL_FRONTEND_URL}?transactionId=${transactionId}`);
});

// IPN endpoint - SSLCommerz calls this server-to-server
const sslIPN = catchAsync(async (req: Request, res: Response) => {
  // IPN includes tran_id and val_id
  const tranId = req.body?.tran_id || req.body?.tranId;
  if (!tranId) {
    res.status(httpStatus.OK).json({ received: true });
    return;
  }

  // If already paid, processSuccess will just re-save (idempotency is fine).
  await paymentServices.processSuccess(String(tranId), req.body);

  res.status(httpStatus.OK).json({ received: true });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const result = await paymentServices.getMyPayments(decoded);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully.",
    data: result,
  });
});

export const paymentControllers = {
  initSubscription,
  initVerifiedBadge,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIPN,
  getMyPayments,
};
