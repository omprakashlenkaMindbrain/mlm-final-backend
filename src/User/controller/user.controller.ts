import { Request, Response } from "express";
import logger from "../../utils/logger";

import { CreateUserInput } from "../schema/user.schema";
import { UpdateUserInput } from "../schema/user.update.schema";

import {
  createUser,
  getDownlineTree,
  updateUser,
} from "../services/user.service";

/* ================= USER ================= */

// Create USER
export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (e: any) {
    logger.error(e);

    return res.status(e.statusCode || 400).json({
      success: false,
      message: e.message || "Something went wrong",
    });
  }
}

// Update USER
export async function updateUserHandler(
  req: Request<{}, {}, UpdateUserInput>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const updates = req.body;

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    logger.error("Error updating user:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// Get Downline
export async function getDownlineHandler(req: Request, res: Response) {
  try {
    const { memId } = req.params;
    const tree = await getDownlineTree(memId);
    res.json({ success: true, data: tree });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/* ================= ADMIN ================= */

// ✅ ADD THIS — REQUIRED BY ADMIN ROUTES
export async function createAdminHandler(
  req: Request,
  res: Response
) {
  try {
    const admin = await createUser({
      ...req.body,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error: any) {
    logger.error("Create admin error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create admin",
    });
  }
}
