import config from "config";
import { Request, Response } from "express";
import { sendMail } from "../../utils/mails/sendmail";
import { uploadfile } from "../../utils/upload";
import { planmodel as PlanModel } from "../model/plan.model";

import AdminPlanModel from "../../Admin/models/adminplan.model"; // ✅ FIXED
import logger from "../../utils/logger";
import { log } from "console";

/* ======================================================
   CREATE PLAN REQUEST (USER)
   POST /api/plan
====================================================== */
export const plancontroller = async (req: Request, res: Response) => {
  try {
    const { plan_name, payment_mode } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    const allowedPlans = ["ibo", "silver ibo", "gold ibo", "star ibo"];
    if (!plan_name || !allowedPlans.includes(plan_name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Please choose a valid plan: ibo, silver ibo, gold ibo, star ibo",
      });
    }

    const allowedPaymentModes = ["upi", "bank"];
    if (!payment_mode || !allowedPaymentModes.includes(payment_mode.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Payment mode must be either upi or bank",
      });
    }

    /* ===============================
       AUTH USER
    =============================== */
    const user = res.locals.user;
    if (!user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ===============================
       FILE CHECK
    =============================== */
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const paymentFile = files?.payment_ss?.[0];

    if (!paymentFile) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    /* ===============================
       UPLOAD PAYMENT PROOF
    =============================== */
    const uploadResult = await uploadfile(
      paymentFile.buffer,
      "payment_screenshots"
    );

    if (!uploadResult?.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload payment proof",
      });
    }

    /* ===============================
       FETCH ADMIN PLAN (BV SOURCE)
    =============================== */
    const normalizedPlanName = plan_name.trim().toLowerCase();

    const adminPlan = await AdminPlanModel.findOne({
      plan_name: normalizedPlanName,
      status: "active",
      
    });
    
    
    if (!adminPlan) {
      return res.status(400).json({
        success: false,
        message: "Selected plan is not available",
      });
    }

    /* ===============================
       PREVENT DUPLICATE PENDING
    =============================== */
    const existingPending = await PlanModel.findOne({
      userId: user._id,
      status: "pending",
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending plan request",
      });
    }

    /* ===============================
       CREATE PLAN REQUEST
    =============================== */
    const plan = await PlanModel.create({
      userId: user._id,
      plan_name: adminPlan.plan_name,
      payment_mode: payment_mode.toLowerCase(),
      payment_ss: uploadResult.url,
      bv: adminPlan.bv,
      status: "pending",
      isActive:true
    });

    /* ===============================
       RESPONSE
    =============================== */
    return res.status(201).json({
      success: true,
      message:
        "Plan request submitted successfully. Waiting for admin approval.",
      data: plan,
    });
  } catch (error: any) {
    logger.error("❌ Plan creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit plan request",
    });
  }
};

/* ======================================================
   UPDATE PAYMENT SCREENSHOT
   PUT /api/plan/payment-ss
====================================================== */
export const updatePaymentSS = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (!user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingPlan = await PlanModel.findOne({
      userId: user._id,
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: "No plan record found",
      });
    }

    const files = req.files as { [key: string]: Express.Multer.File[] };
    const paymentFile = files?.payment_ss?.[0];

    if (!paymentFile) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    const uploadResult = await uploadfile(paymentFile.buffer, "payment");

    if (!uploadResult?.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload payment screenshot",
      });
    }

    const updatedPlan = await PlanModel.findOneAndUpdate(
      { userId: user._id },
      {
        payment_ss: uploadResult.url,
        status: "pending",
      },
      { new: true }
    );

    /* ===============================
       EMAIL NOTIFICATION
    =============================== */
    sendMail({
      to: config.get<string>("ADMIN_EMAIL"),
      subject: "Payment Screenshot Updated",
      html: `
        <h3>Payment Screenshot Updated</h3>
        <p><strong>User:</strong> ${user.name}</p>
        <p><strong>User ID:</strong> ${user._id}</p>
        <p>Updated at ${new Date().toLocaleString()}</p>
      `,
    }).catch((err) => logger.error("Email error:", err));

    return res.status(200).json({
      success: true,
      message: "Payment screenshot updated successfully",
      data: updatedPlan,
    });
  } catch (error: any) {
    logger.error("❌ Update payment SS error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment screenshot",
    });
  }
};