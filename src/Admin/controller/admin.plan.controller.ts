import { Request, Response } from "express";
import AdminPlanModel from "../models/adminplan.model";
import { planmodel as PlanModel } from "../../plan/model/plan.model";

import UserModel from "../../User/models/user.model";
import logger from "../../utils/logger";

/* ======================================================
   CREATE ADMIN PLAN
   POST /api/admin/plan
====================================================== */
export const adminplan = async (req: Request, res: Response) => {
  try {
    const { plan_name, plan_price, bv } = req.body;

    if (!plan_name || typeof plan_name !== "string") {
      return res.status(400).json({ success: false, message: "Invalid plan_name" });
    }

    if (Number.isNaN(Number(plan_price)) || Number.isNaN(Number(bv))) {
      return res.status(400).json({ success: false, message: "Invalid price or bv" });
    }

    const exists = await AdminPlanModel.findOne({ plan_name: plan_name.trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Plan already exists" });
    }

    const plan = await AdminPlanModel.create({
      plan_name: plan_name.trim(),
      plan_price: Number(plan_price),
      bv: Number(bv),
      status: "active",
    });

    return res.status(201).json({ success: true, data: plan });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Plan creation failed" });
  }
};

/* ======================================================
   🔥 REQUIRED BY DASHBOARD
   GET /api/admin/user/allplandetails
====================================================== */
export const getAllPlanDetails = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [plans, totalPlans] = await Promise.all([
      PlanModel.find()
        .populate("userId", "name email mobno memId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PlanModel.countDocuments(),
    ]);

    const stats = {
      totalUsers: await UserModel.countDocuments(),
      pending: await PlanModel.countDocuments({ status: "pending" }),
      approved: await PlanModel.countDocuments({ status: "approved" }),
      rejected: await PlanModel.countDocuments({ status: "rejected" }),
    };

    return res.json({
      success: true,
      data: plans,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPlans / limit),
        totalPlans,
        limit,
      },
      stats,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch plan details" });
  }
};
