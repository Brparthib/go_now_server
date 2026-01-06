import { Router } from "express";
import { ModuleRoute } from "../interfaces/interfaces";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { travelPlanRoutes } from "../modules/travelPlans/travelPlan.route";
import { joinRequestRoutes } from "../modules/joinRequest/joinRequest.route";

export const router = Router();

const moduleRoutes: ModuleRoute[] = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/plan",
    route: travelPlanRoutes
  },
  {
    path: "/join",
    route: joinRequestRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
