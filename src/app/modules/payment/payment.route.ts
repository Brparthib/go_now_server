import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { paymentControllers } from "./payment.controller";
import { initBadgeZodSchema, initSubscriptionZodSchema } from "./payment.validation";

const router = Router();

// init subscription
router.post(
  "/subscription/init",
  checkAuth(...Object.values(UserRole)),
  validateRequest(initSubscriptionZodSchema),
  paymentControllers.initSubscription
);

// init verified badge
router.post(
  "/verified-badge/init",
  checkAuth(...Object.values(UserRole)),
  validateRequest(initBadgeZodSchema),
  paymentControllers.initVerifiedBadge
);

// SSLCommerz callback URLs (should be public)
router.post("/ssl/success", paymentControllers.sslSuccess);
router.post("/ssl/fail", paymentControllers.sslFail);
router.post("/ssl/cancel", paymentControllers.sslCancel);

// IPN (server-to-server)
router.post("/ssl/ipn", paymentControllers.sslIPN);

// my payments
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  paymentControllers.getMyPayments
);

export const paymentRoutes = router;
