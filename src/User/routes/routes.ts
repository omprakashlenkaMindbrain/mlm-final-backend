import express from "express";
import {
  createUserSessionHandler,
  deleteSessionHandler,
  getUserSessionsHandler,
} from "../controller/session.controller";
import {
  createUserHandler,
  getDownlineHandler,
  updateUserHandler,
} from "../controller/user.controller";
import { requireUser } from "../middlewares/requiredUser";
import validateResources from "../middlewares/validateResource";
import { createSessionSchema } from "../schema/session.schema";
import { createUserSchema } from "../schema/user.schema";

const userRouter = express.Router();

/**
 * POST /api/user
 */
userRouter.post(
  "/",
  validateResources(createUserSchema),
  createUserHandler
);

/**
 * POST /api/user/session
 */
userRouter.post(
  "/session",
  validateResources(createSessionSchema),
  createUserSessionHandler
);

/**
 * GET /api/user/session
 */
userRouter.get(
  "/session",
  requireUser,
  getUserSessionsHandler
);

/**
 * DELETE /api/user/session
 */
userRouter.delete(
  "/session",
  requireUser,
  deleteSessionHandler
);

/**
 * PUT /api/user/me
 */
userRouter.put(
  "/me",
  requireUser,
  updateUserHandler
);

/**
 * GET /api/user/showdownline/:memId
 */
userRouter.get(
  "/showdownline/:memId",
  requireUser,
  getDownlineHandler
);

export default userRouter;
