import z from "zod";
import { PaymentPurpose, SubscriptionPlan } from "./payment.interface";

export const initSubscriptionZodSchema = z.object({
  planType: z.enum(SubscriptionPlan, { error: "Invalid subscription planType." }),
  phoneNumber: z.string().min(6).max(20).optional(),
  address: z.string().max(200).optional(),
});

export const initBadgeZodSchema = z.object({
  phoneNumber: z.string().min(6).max(20).optional(),
  address: z.string().max(200).optional(),
});

// for callback - we validate by reading req.query and/or req.body
export const sslCallbackQueryZodSchema = z.object({
  transactionId: z.string().min(5),
});

export const paymentPurposeZodSchema = z.enum(PaymentPurpose);
