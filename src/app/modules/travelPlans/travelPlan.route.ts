import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { travelPlanControllers } from "./travelPlan.controller";
import {
  createTravelPlanZodSchema,
  updateTravelPlanZodSchema,
} from "./travelPlan.validation";

const router = Router();

/**
 * Public list (Explore)
 * GET /api/plan?country=&city=&from=&to=&type=&status=&page=&limit=
 */
router.get("/", travelPlanControllers.getPublicTravelPlans);

// Match endpoint (must be before /:id)
router.get("/match", travelPlanControllers.matchTravelPlans);

/**
 * Public details for PUBLIC plans.
 * If you want private-plan access too, you can add checkAuth here.
 */
router.get("/:id", travelPlanControllers.getTravelPlanById);

/**
 * Create plan (logged in)
 * POST /api/plan
 */
router.post(
  "/create",
  checkAuth(...Object.values(UserRole)),
  validateRequest(createTravelPlanZodSchema),
  travelPlanControllers.createTravelPlan
);

/**
 * My plans
 * GET /api/plan/my-plan
 */
router.get(
  "/my-plan",
  checkAuth(...Object.values(UserRole)),
  travelPlanControllers.getMyTravelPlans
);

/**
 * Update (owner/admin)
 * PATCH /api/plan/:id
 */
router.patch(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  validateRequest(updateTravelPlanZodSchema),
  travelPlanControllers.updateTravelPlan
);

/**
 * Delete (owner/admin) - soft delete
 * DELETE /api/plan/:id
 */
router.delete(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  travelPlanControllers.deleteTravelPlan
);

export const travelPlanRoutes = router;
