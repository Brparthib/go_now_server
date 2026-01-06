/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Payment } from "./payment.model";
import {
  PaymentPurpose,
  PaymentStatus,
  SubscriptionPlan,
} from "./payment.interface";
import { User } from "../user/user.model";
import { sslService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerzInit } from "../sslCommerz/sslCommerz.interface";

const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, number> = {
  MONTHLY: 499,
  YEARLY: 4999,
};

const VERIFIED_BADGE_PRICE = 299;

const addMonths = (d: Date, months: number) => {
  const date = new Date(d);
  date.setMonth(date.getMonth() + months);
  return date;
};

const addYears = (d: Date, years: number) => {
  const date = new Date(d);
  date.setFullYear(date.getFullYear() + years);
  return date;
};

const initSubscription = async (
  decoded: JwtPayload,
  payload: { planType: SubscriptionPlan; phoneNumber?: string; address?: string }
) => {
  const user = await User.findById(decoded.userId);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }

  const amount = SUBSCRIPTION_PRICES[payload.planType];
  const transactionId = `SUB_${uuidv4().replace(/-/g, "").slice(0, 20)}`;

  const payment = await Payment.create({
    userId: user._id,
    transactionId,
    purpose: PaymentPurpose.SUBSCRIPTION,
    planType: payload.planType,
    amount,
    currency: "BDT",
    status: PaymentStatus.INITIATED,
  });

  const sslPayload: ISSLCommerzInit = {
    transactionId,
    amount,
    name: user.fullName,
    email: user.email,
    phoneNumber: payload.phoneNumber || "N/A",
    address: payload.address || "N/A",
    purpose: "SUBSCRIPTION",
    productName:
      payload.planType === SubscriptionPlan.MONTHLY
        ? "TravelBuddy Subscription (Monthly)"
        : "TravelBuddy Subscription (Yearly)",
  };

  const session = await sslService.sslPaymentInit(sslPayload);

  return {
    paymentId: payment._id,
    transactionId,
    gateway: "SSLCOMMERZ",
    session, // contains GatewayPageURL
  };
};

const initVerifiedBadge = async (
  decoded: JwtPayload,
  payload: { phoneNumber?: string; address?: string }
) => {
  const user = await User.findById(decoded.userId);
  if (!user || user.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "User not found!!");

  // must be subscribed first
  if (!user.isSubscribed) {
    throw new AppError(httpStatus.FORBIDDEN, "You must be subscribed to buy verified badge.");
  }
  if (user.hasVerifiedBadge) {
    throw new AppError(httpStatus.BAD_REQUEST, "You already have verified badge.");
  }

  const amount = VERIFIED_BADGE_PRICE;
  const transactionId = `BADGE_${uuidv4().replace(/-/g, "").slice(0, 18)}`;

  const payment = await Payment.create({
    userId: user._id,
    transactionId,
    purpose: PaymentPurpose.VERIFIED_BADGE,
    amount,
    currency: "BDT",
    status: PaymentStatus.INITIATED,
  });

  const sslPayload: ISSLCommerzInit = {
    transactionId,
    amount,
    name: user.fullName,
    email: user.email,
    phoneNumber: payload.phoneNumber || "N/A",
    address: payload.address || "N/A",
    purpose: "VERIFIED_BADGE",
    productName: "TravelBuddy Verified Badge",
  };

  const session = await sslService.sslPaymentInit(sslPayload);

  return {
    paymentId: payment._id,
    transactionId,
    gateway: "SSLCOMMERZ",
    session,
  };
};

/**
 * Process SSL callback + validate using val_id
 * SSL sends many fields (tran_id, val_id, amount, etc.) in success redirect and IPN.
 * We trust ONLY after validation API. :contentReference[oaicite:4]{index=4}
 */
const processSuccess = async (transactionId: string, sslPayload: any) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found!!");

  // Validate with SSLCommerz
  const validation = await sslService.validatePayment(sslPayload);

  // Basic safety checks: tran_id must match
  if (validation?.tran_id && validation.tran_id !== transactionId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Transaction mismatch.");
  }

  // Update payment status
  payment.status = PaymentStatus.PAID;
  payment.paymentGateWayData = validation;
  await payment.save();

  // Apply benefits
  const user = await User.findById(payment.userId);
  if (!user || user.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "User not found!!");

  if (payment.purpose === PaymentPurpose.SUBSCRIPTION) {
    user.isSubscribed = true;

    // Recommended: track expiry
    const now = new Date();
    const currentExpiry = (user as any).subscriptionExpiresAt
      ? new Date((user as any).subscriptionExpiresAt)
      : null;

    const base = currentExpiry && currentExpiry > now ? currentExpiry : now;

    const expires =
      payment.planType === SubscriptionPlan.YEARLY
        ? addYears(base, 1)
        : addMonths(base, 1);

    // if you add this field in user model/interface:
    (user as any).subscriptionExpiresAt = expires;

    await user.save();
  }

  if (payment.purpose === PaymentPurpose.VERIFIED_BADGE) {
    // ensure still subscribed
    if (!user.isSubscribed) {
      throw new AppError(httpStatus.FORBIDDEN, "Subscription required for badge.");
    }
    user.hasVerifiedBadge = true;
    await user.save();
  }

  return { payment, validation };
};

const processFail = async (transactionId: string, payload?: any) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found!!");
  payment.status = PaymentStatus.FAILED;
  if (payload) payment.paymentGateWayData = payload;
  await payment.save();
  return payment;
};

const processCancel = async (transactionId: string, payload?: any) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found!!");
  payment.status = PaymentStatus.CANCELED;
  if (payload) payment.paymentGateWayData = payload;
  await payment.save();
  return payment;
};

const getMyPayments = async (decoded: JwtPayload) => {
  const list = await Payment.find({ userId: decoded.userId }).sort({ createdAt: -1 });
  return list;
};

export const paymentServices = {
  initSubscription,
  initVerifiedBadge,
  processSuccess,
  processFail,
  processCancel,
  getMyPayments,
};
