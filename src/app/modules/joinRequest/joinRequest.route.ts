import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { joinRequestControllers } from "./joinRequest.controller";
import {
  createJoinRequestZodSchema,
  updateJoinRequestStatusZodSchema,
} from "./joinRequest.validation";

const router = Router();

// Create request (logged-in)
router.post(
  "/",
  checkAuth(...Object.values(UserRole)),
  validateRequest(createJoinRequestZodSchema),
  joinRequestControllers.createJoinRequest
);

// Host incoming requests
router.get(
  "/incoming",
  checkAuth(...Object.values(UserRole)),
  joinRequestControllers.getIncomingRequests
);

// My outgoing requests
router.get(
  "/outgoing",
  checkAuth(...Object.values(UserRole)),
  joinRequestControllers.getOutgoingRequests
);

// Host accept/reject
router.patch(
  "/:id/status",
  checkAuth(...Object.values(UserRole)),
  validateRequest(updateJoinRequestStatusZodSchema),
  joinRequestControllers.updateRequestStatus
);

// Requester cancel
router.patch(
  "/:id/cancel",
  checkAuth(...Object.values(UserRole)),
  joinRequestControllers.cancelRequest
);

export const joinRequestRoutes = router;
