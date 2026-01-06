import z from "zod";
import { UserRole, UserStatus } from "./user.interface";

export const authProviderZodSchema = z.object({
  provider: z.string({
    error: "Auth provider must be a string.",
  }),
  providerId: z.string({
    error: "Provider ID must be a string.",
  }),
});

export const locationZodSchema = z.object({
  country: z.string({ error: "Country must be a string." }).optional(),

  city: z.string({ error: "City must be a string." }).optional(),

  geo: z
    .object({
      type: z.literal("Point"),
      coordinates: z
        .array(z.number({ error: "Coordinates must be numbers." }))
        .length(2, { message: "Coordinates must be [longitude, latitude]." }),
    })
    .optional(),
});

export const ratingSummaryZodSchema = z.object({
  avg: z
    .number({ error: "Average rating must be a number." })
    .min(0, { message: "Rating cannot be less than 0." })
    .max(5, { message: "Rating cannot be greater than 5." })
    .default(0),

  count: z
    .number({ error: "Rating count must be a number." })
    .min(0, { message: "Rating count cannot be negative." })
    .default(0),
});

export const createUserZodSchema = z.object({
  fullName: z
    .string({ error: "Full name must be a string." })
    .max(100, { message: "Full name cannot exceed 100 characters." }),

  email: z
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string({ error: "Password must be a string." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),

  role: z
    .enum(UserRole, {
      error: "Invalid user role.",
    })
    .optional(),

  status: z
    .enum(UserStatus, {
      error: "Invalid user status.",
    })
    .optional(),

  auths: z.array(authProviderZodSchema).optional(),

  imageUrl: z.url({ message: "Invalid image URL format." }).optional(),

  bio: z
    .string({ error: "Bio must be a string." })
    .max(500, { message: "Bio cannot exceed 500 characters." })
    .optional(),

  travelInterests: z
    .array(z.string({ error: "Travel interest must be a string." }))
    .optional(),

  visitedCountries: z
    .array(z.string({ error: "Country name must be a string." }))
    .optional(),

  currentLocation: locationZodSchema.optional(),

  isSubscribed: z
    .boolean({ error: "isSubscribed must be boolean." })
    .optional(),

  hasVerifiedBadge: z
    .boolean({ error: "hasVerifiedBadge must be boolean." })
    .optional(),
});

export const updateUserZodSchema = z.object({
  email: z.email({ message: "Invalid email address format." }).optional(),

  password: z
    .string({ error: "Password must be a string." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    })
    .optional(),

  role: z.enum(UserRole).optional(),

  status: z.enum(UserStatus).optional(),

  fullName: z
    .string({ error: "Full name must be a string." })
    .max(100)
    .optional(),

  imageUrl: z.url({ message: "Invalid image URL format." }).optional(),

  bio: z.string({ error: "Bio must be a string." }).max(500).optional(),

  travelInterests: z.array(z.string()).optional(),

  visitedCountries: z.array(z.string()).optional(),

  currentLocation: locationZodSchema.optional(),

  isSubscribed: z.boolean().optional(),

  hasVerifiedBadge: z.boolean().optional(),

  ratingSummary: ratingSummaryZodSchema.optional(),

  isDeleted: z.boolean({ error: "isDeleted must be boolean." }).optional(),
});
