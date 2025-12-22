import { Router } from "express";
import { ModuleRoute } from "../interfaces";

export const router = Router();

const moduleRoutes: ModuleRoute[] = []

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
});


