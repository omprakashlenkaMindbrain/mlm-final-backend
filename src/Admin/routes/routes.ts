import express, { Request, Response } from "express";
import { uploader } from "../../utils/upload";

/* ================= Controllers ================= */

// Session / Auth
import {
  createAdminSessionHandler,
  deleteAdminSessionHandler,
  getAdminSessionHandler,
} from "../controller/session.controller";

// KYC
import { getKycdetails, updateKycStatus } from "../../kyc/controller/kyc.controller";

// Admin / Users / Plan
import { generateIncomeController } from "../controller/admin.genincome.controller";
import {
  adminplan,
  getAllPlanDetails, // ✅ SAME IMPORT
} from "../controller/admin.plan.controller";
import { updatePlanStatus } from "../controller/admin.planstatus.controller";
import { showDownlineController } from "../controller/adminshowdownline.controller";
import { createAdminHandler } from "../controller/user.controller";

// Bank / Payout
import { postPayoutController } from "../controller/admin.postpayout.controller";
import {
  createbankdetailscontroller,
  getBankdetails,
  updatedbankdetails,
} from "../controller/bankdetails.controller";
import { payoutcontroller } from "../controller/payout.controller";

// QR
import {
  editQrHandler,
  getQrComtroller,
  setQrHandler,
} from "../controller/qr.controller";

/* ================= Middlewares ================= */

import { requireAdmin } from "../middlewares/requiredAdmin";
import validateResources from "../middlewares/validateResource";

/* ================= Schemas ================= */

import { getAllPayoutHistoryController, getUserPayoutHistoryController } from "../controller/admin.payouthistory.controller";
import { createAdminSchema } from "../schema/admin.schema";
import { createSessionSchema } from "../schema/session.schema";

const Adminroutes = express.Router();


/* ================= ADMIN AUTH ================= */

// POST /api/admin
Adminroutes.post(
  "/",
  validateResources(createAdminSchema),
  createAdminHandler
);

// POST /api/admin/session
Adminroutes.post(
  "/session",
  validateResources(createSessionSchema),
  createAdminSessionHandler
);

// GET /api/admin/sessions
Adminroutes.get(
  "/sessions",
  requireAdmin,
  getAdminSessionHandler
);

// DELETE /api/admin/sessions
Adminroutes.delete(
  "/sessions",
  requireAdmin,
  deleteAdminSessionHandler
);

/* ================= KYC / PLAN ================= */

// PUT /api/admin/kyc/update/:id
Adminroutes.put(
  "/kyc/update/:userid",
  requireAdmin,
  updateKycStatus 
);

// PUT /api/admin/plan/update/:id
Adminroutes.put(
  "/plan/update/:id",
  requireAdmin,
  updatePlanStatus
);

// POST /api/admin/plan
Adminroutes.post(
  "/plan",
  adminplan
);

// REQUIRED BY DASHBOARD
// GET /api/admin/user/allplandetails
Adminroutes.get(
  "/user/allplandetails",
  requireAdmin,
  getAllPlanDetails
);

/* ================= BUSINESS ================= */

// POST /api/admin/genincome
Adminroutes.post(
  "/genincome",
  requireAdmin,
  generateIncomeController
);

// GET /api/admin/showjoin
Adminroutes.get(
  "/showjoin",
  requireAdmin,
  showDownlineController
);

/* ================= QR ================= */

// POST /api/admin/session/qr
Adminroutes.post(
  "/session/qr",
  requireAdmin,
  uploader.single("qr"),
  setQrHandler
);

// PUT /api/admin/session/qr-edit
Adminroutes.put(
  "/session/qr-edit",
  requireAdmin,
  uploader.single("qr"),
  editQrHandler
);

// GET /api/admin/qr
Adminroutes.get(
  "/qr",
  getQrComtroller
);

/* ================= BANK ================= */

// POST /api/admin/bankdetails
Adminroutes.post(
  "/bankdetails",
  requireAdmin,
  createbankdetailscontroller
);

// PUT /api/admin/bankdetails/:id
Adminroutes.put(
  "/bankdetails/:id",
  requireAdmin,
  updatedbankdetails
);

// GET /api/admin/getbankdetails
Adminroutes.get(
  "/getbankdetails",
  getBankdetails
);

// GET /api/admin/payout
Adminroutes.post(
  "/payout",
  requireAdmin,
  postPayoutController
);

Adminroutes.get(
  "/payout",
  requireAdmin,
  payoutcontroller
);


Adminroutes.get("/getkyc/:userId",requireAdmin,getKycdetails)

/* ================= TEST ================= */

Adminroutes.get("/test", (_req: Request, res: Response) => {
  res.status(200).send("Hello world from the test api");
});

//admin payout history

Adminroutes.get('/payouthistory',getAllPayoutHistoryController);
Adminroutes.get('/payouthistory/user/:userId',getUserPayoutHistoryController);

export default Adminroutes;