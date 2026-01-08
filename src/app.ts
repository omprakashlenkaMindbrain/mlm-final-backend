import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";

import connectDB from "./utils/connect";

/* ===================== ROUTES ===================== */
import Adminroutes from "./Admin/routes/routes";
import userRouter from "./User/routes/routes";
import kycrouter from "./kyc/routes/kyc.routes";
import planrouter from "./plan/routes/plan.routes";
import autocollectionRoute from "./autocollection/routes/autocollection.routes";


/* ===================== USER SESSION ===================== */
import {
  createUserSessionHandler,
  getUserSessionsHandler,
  deleteSessionHandler,
} from "./User/controller/session.controller";

/* ===================== VALIDATION ===================== */
import { createSessionSchema } from "./User/schema/session.schema";
import validateResources from "./User/middlewares/validateResource";

/* ===================== AUTH ===================== */
import deserializeAdmin from "./Admin/middlewares/deserializeAdmin";
import deserializeUser from "./User/middlewares/deserializeUser";

const app: Application = express();
const port = config.get<number>("port") || 8090;

/* ===================== CORS ===================== */
const whitelist = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "https://mybmpl.com",
  "https://www.mybmpl.com",
  "https://admin.mybmpl.com",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (whitelist.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ❌ DO NOT add app.options("*") or app.options("/*") */
/* CORS already handles preflight requests */

/* ===================== CORE ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===================== HEALTH ===================== */
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "MindBrain API running",
  });
});

/* ===================== PUBLIC ===================== */
app.post(
  "/api/session",
  validateResources(createSessionSchema),
  createUserSessionHandler
);

/* ===================== DESERIALIZERS ===================== */
app.use(deserializeUser);
app.use(deserializeAdmin);

/* ===================== USER SESSION ===================== */
app.get("/api/session", getUserSessionsHandler);
app.delete("/api/session", deleteSessionHandler);

/* ===================== PROTECTED ROUTES ===================== */
app.use("/api/admin", Adminroutes);
app.use("/api/user", userRouter);
app.use("/api/kyc", kycrouter);
app.use("/api/plan", planrouter);
app.use('/api/autocollection',autocollectionRoute);

/* ===================== SERVER ===================== */
async function startServer() {
  console.log("👉 Starting server...");

  try {
    await connectDB();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

startServer();

export default app;
