import express from "express";
import { requireUser } from "../../User/middlewares/requiredUser";
import { uploadPaymentHandler } from "../../utils/MulterErrorHandler";
import { uploader } from "../../utils/upload";
import { plancontroller, updatePaymentSS } from "../controller/plan.controller";

const planrouter = express.Router();

/**
 * POST /api/plan
 * Create plan / upload payment screenshot
 */
planrouter.post(
  "/",
  requireUser,
  uploader.fields([{ name: "payment_ss", maxCount: 1 }]),
  plancontroller
);

/**
 * PUT /api/plan/update/:id
 * Update payment screenshot
 */
planrouter.put(
  "/update/:id",
  requireUser,
  uploadPaymentHandler,
  updatePaymentSS
);

export default planrouter;
