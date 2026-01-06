import { model, Schema } from "mongoose";
import {
  AuthProvider,
  IUser,
  UserLocation,
  UserRatingSummary,
  UserRole,
  UserStatus,
} from "./user.interface";

const authProviderSchema = new Schema<AuthProvider>(
  {
    provider: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const locationSchema = new Schema<UserLocation>(
  {
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const ratingSummarySchema = new Schema<UserRatingSummary>(
  {
    avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    auths: [authProviderSchema],
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    bio: {
      type: String,
    },
    travelInterests: {
      type: [String],
      default: [],
    },
    visitedCountries: {
      type: [String],
      default: [],
    },
    currentLocation: {
      type: locationSchema,
      default: undefined,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    hasVerifiedBadge: {
      type: Boolean,
      default: false,
    },
    ratingSummary: {
      type: ratingSummarySchema,
      default: () => ({ avg: 0, count: 0 }),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
