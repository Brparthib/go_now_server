import { Types } from "mongoose";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface UserLocation {
  country?: string;
  city?: string;
  geo?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface UserRatingSummary {
  avg: number; // 0 to 5
  count: number; // >= 0
}

export interface AuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  auths?: AuthProvider[];
  fullName: string;
  imageUrl?: string;
  bio?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
  currentLocation?: UserLocation;
  isSubscribed?: boolean;
  hasVerifiedBadge?: boolean;
  ratingSummary?: UserRatingSummary;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
