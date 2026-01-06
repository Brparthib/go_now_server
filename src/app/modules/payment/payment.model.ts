import { model, Schema } from "mongoose";
import {
  IPayment,
  PaymentGateway,
  PaymentPurpose,
  PaymentStatus,
  SubscriptionPlan,
} from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      default: PaymentGateway.SSLCOMMERZ,
      index: true,
    },

    purpose: {
      type: String,
      enum: Object.values(PaymentPurpose),
      required: true,
      index: true,
    },

    planType: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: undefined,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.INITIATED,
      index: true,
    },

    paymentGateWayData: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
