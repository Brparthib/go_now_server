import type { Router } from "express";

export interface ModuleRoute {
  path: string;
  route: Router;
}
