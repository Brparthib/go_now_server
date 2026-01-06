import z from "zod";
import { PlanStatus, PlanVisibility, TravelType } from "./travelPlan.interface";

const destinationZodSchema = z.object({
  country: z
    .string({ error: "Country must be a string." })
    .min(1, { message: "Country is required." })
    .max(80, { message: "Country cannot exceed 80 characters." }),

  city: z
    .string({ error: "City must be a string." })
    .min(1, { message: "City is required." })
    .max(80, { message: "City cannot exceed 80 characters." }),
});

export const createTravelPlanZodSchema = z.object({
  destination: destinationZodSchema,

  startDate: z.coerce.date({
    error: "Start date must be a valid date.",
  }),

  endDate: z.coerce.date({
    error: "End date must be a valid date.",
  }),

  budgetMin: z
    .number({ error: "budgetMin must be a number." })
    .min(0, { message: "budgetMin cannot be negative." })
    .optional(),

  budgetMax: z
    .number({ error: "budgetMax must be a number." })
    .min(0, { message: "budgetMax cannot be negative." })
    .optional(),

  travelType: z.enum(TravelType, { error: "Invalid travel type." }),

  description: z
    .string({ error: "Description must be a string." })
    .max(2000, { message: "Description cannot exceed 2000 characters." })
    .optional(),

  visibility: z.enum(PlanVisibility).optional(),

  status: z.enum(PlanStatus).optional(),

  maxParticipants: z
    .number({ error: "maxParticipants must be a number." })
    .int({ message: "maxParticipants must be an integer." })
    .min(1, { message: "maxParticipants must be at least 1." })
    .max(50, { message: "maxParticipants cannot exceed 50." })
    .optional(),
});

export const updateTravelPlanZodSchema = z.object({
  destination: destinationZodSchema.optional(),

  startDate: z.coerce.date().optional(),

  endDate: z.coerce.date().optional(),

  budgetMin: z.number().min(0).optional(),

  budgetMax: z.number().min(0).optional(),

  travelType: z.enum(TravelType).optional(),

  description: z.string().max(2000).optional(),

  visibility: z.enum(PlanVisibility).optional(),

  status: z.enum(PlanStatus).optional(),

  maxParticipants: z.number().int().min(1).max(50).optional(),

  // keep system fields out of user updates
  isDeleted: z.never().optional(),
  hostId: z.never().optional(),
});
