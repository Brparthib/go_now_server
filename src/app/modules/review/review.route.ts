import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { reviewControllers } from "./review.controller";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

// Create review (logged-in)
router.post(
  "/",
  checkAuth(...Object.values(UserRole)),
  validateRequest(createReviewZodSchema),
  reviewControllers.createReview
);

// Public: reviews of a user
router.get("/user/:userId", reviewControllers.getReviewsByUserId);

// Update (owner)
router.patch(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  validateRequest(updateReviewZodSchema),
  reviewControllers.updateReview
);

// Delete (owner) - soft delete
router.delete(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  reviewControllers.deleteReview
);

export const reviewRoutes = router;
