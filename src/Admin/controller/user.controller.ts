import { Request, Response } from "express";
import logger from "../../utils/logger";

import { createAdmin } from "../services/user.service";
import AdminModel from "../models/user.model";

// CREATE ADMIN
export async function createAdminHandler(
  req: Request,
  res: Response
) {
  try {
    logger.info("Create admin payload:", req.body);

    const count = await AdminModel.countDocuments();
    if (count >= 1) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const admin = await createAdmin(req.body);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error: any) {
    logger.error("Create admin error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
