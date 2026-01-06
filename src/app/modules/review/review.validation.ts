import z from "zod";

export const createReviewZodSchema = z.object({
  planId: z.string({ error: "planId must be a string." }).min(1),
  revieweeId: z.string({ error: "revieweeId must be a string." }).min(1),

  rating: z
    .number({ error: "rating must be a number." })
    .min(1, { message: "rating must be at least 1." })
    .max(5, { message: "rating must be at most 5." }),

  comment: z
    .string({ error: "comment must be a string." })
    .max(1000, { message: "comment cannot exceed 1000 characters." })
    .optional(),
});

export const updateReviewZodSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "rating must be at least 1." })
    .max(5, { message: "rating must be at most 5." })
    .optional(),

  comment: z.string().max(1000).optional(),

  // protect system fields
  planId: z.never().optional(),
  reviewerId: z.never().optional(),
  revieweeId: z.never().optional(),
  isDeleted: z.never().optional(),
});
