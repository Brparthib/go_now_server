import { Types } from "mongoose";

export enum TravelType {
  SOLO = "SOLO",
  FAMILY = "FAMILY",
  FRIENDS = "FRIENDS",
}

export enum PlanVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum PlanStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface Destination {
  country: string;
  city: string;
}

export interface ITravelPlan {
  _id?: Types.ObjectId;

  hostId: Types.ObjectId; // User _id

  destination: Destination;

  startDate: Date;
  endDate: Date;

  budgetMin?: number;
  budgetMax?: number;

  travelType: TravelType;

  description?: string;

  visibility?: PlanVisibility;

  status?: PlanStatus;

  maxParticipants?: number;

  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
