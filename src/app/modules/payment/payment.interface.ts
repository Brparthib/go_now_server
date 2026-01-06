import { Types } from "mongoose";

export enum PaymentGateway {
  SSLCOMMERZ = "SSLCOMMERZ",
}

export enum PaymentPurpose {
  SUBSCRIPTION = "SUBSCRIPTION",
  VERIFIED_BADGE = "VERIFIED_BADGE",
}

export enum SubscriptionPlan {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum PaymentStatus {
  INITIATED = "INITIATED",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

export interface IPayment {
  _id?: Types.ObjectId;

  userId: Types.ObjectId;

  transactionId: string;

  gateway: PaymentGateway;
  purpose: PaymentPurpose;

  // only for subscription
  planType?: SubscriptionPlan;

  amount: number;
  currency: string; // "BDT"

  status: PaymentStatus;

  paymentGateWayData?: unknown;

  createdAt?: Date;
  updatedAt?: Date;
}
