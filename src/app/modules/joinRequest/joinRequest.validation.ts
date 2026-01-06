import z from "zod";
import { JoinRequestStatus } from "./joinRequest.interface";

export const createJoinRequestZodSchema = z.object({
  planId: z.string({ error: "planId must be a string." }).min(1),
  message: z
    .string({ error: "Message must be a string." })
    .max(500, { message: "Message cannot exceed 500 characters." })
    .optional(),
});

// Host accepts/rejects
export const updateJoinRequestStatusZodSchema = z.object({
  status: z.enum([JoinRequestStatus.ACCEPTED, JoinRequestStatus.REJECTED], {
    error: "Status must be ACCEPTED or REJECTED.",
  }),
});

// Requester cancels
export const cancelJoinRequestZodSchema = z.object({
  // no body needed, but keep schema for uniformity if you want
});
