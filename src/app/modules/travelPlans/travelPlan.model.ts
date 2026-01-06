import { model, Schema } from "mongoose";
import {
  Destination,
  ITravelPlan,
  PlanStatus,
  PlanVisibility,
  TravelType,
} from "./travelPlan.interface";

const destinationSchema = new Schema<Destination>(
  {
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  { _id: false, versionKey: false }
);

const travelPlanSchema = new Schema<ITravelPlan>(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    destination: {
      type: destinationSchema,
      required: true,
    },

    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },

    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },

    travelType: {
      type: String,
      enum: Object.values(TravelType),
      required: true,
      index: true,
    },

    description: { type: String, trim: true },

    visibility: {
      type: String,
      enum: Object.values(PlanVisibility),
      default: PlanVisibility.PUBLIC,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(PlanStatus),
      default: PlanStatus.UPCOMING,
      index: true,
    },

    maxParticipants: { type: Number, min: 1 },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Helpful compound indexes for filtering
travelPlanSchema.index({ "destination.country": 1, "destination.city": 1 });
travelPlanSchema.index({ visibility: 1, isDeleted: 1 });

export const TravelPlan = model<ITravelPlan>("TravelPlan", travelPlanSchema);
