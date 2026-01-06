import { Types } from "mongoose";

export interface IReview {
  _id?: Types.ObjectId;

  planId: Types.ObjectId;

  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;

  rating: number; // 1 - 5
  comment?: string;

  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
