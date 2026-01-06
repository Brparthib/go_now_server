import { Types } from "mongoose";

export enum JoinRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED",
}

export interface IJoinRequest {
  _id?: Types.ObjectId;

  planId: Types.ObjectId;      // TravelPlan _id
  hostId: Types.ObjectId;      // denormalized from plan.hostId
  requesterId: Types.ObjectId; // user who wants to join

  message?: string;

  status?: JoinRequestStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
