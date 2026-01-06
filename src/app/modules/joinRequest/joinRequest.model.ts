import { model, Schema } from "mongoose";
import { IJoinRequest, JoinRequestStatus } from "./joinRequest.interface";

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: Object.values(JoinRequestStatus),
      default: JoinRequestStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate requests per plan per requester
joinRequestSchema.index({ planId: 1, requesterId: 1 }, { unique: true });

export const JoinRequest = model<IJoinRequest>("JoinRequest", joinRequestSchema);
