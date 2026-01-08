import config from "config";
import { Request, Response } from "express";
import { signJwt } from "../../utils/jwt.utils";

import AdminSessionModel from "../models/session.model";
import AdminModel from "../models/user.model";
import { validateAdminPassword } from "../services/user.service";

const isProd = process.env.NODE_ENV === "production";

/* ======================================================
   POST /api/admin/session  → ADMIN LOGIN
====================================================== */
export async function createAdminSessionHandler(
  req: Request,
  res: Response
) {
  try {
    const admin = await validateAdminPassword(req.body);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // ✅ FIX: schema requires `admin`
    const session = await AdminSessionModel.create({
      admin: admin._id,
      userAgent: req.get("user-agent") || "",
      valid: true,
    });

    const accessToken = signJwt(
      {
        adminId: admin._id,
        session: session._id,
        role: "admin",
      },
      { expiresIn: config.get("accessTokenTtl") }
    );
    

    res.cookie("accessToken", accessToken, {  // or any name like "adminAccessToken"
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      accessToken,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        mobno: admin.mobno,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
}

/* ======================================================
   GET /api/admin/session → CURRENT ADMIN
====================================================== */
export async function getAdminSessionHandler(
  _req: Request,
  res: Response
) {
  const adminId = res.locals.admin?._id;

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const admin = await AdminModel.findById(adminId)
    .select("-password")
    .lean();

  const sessions = await AdminSessionModel.find({
    admin: adminId,
    valid: true,
  });

  console.log(sessions);
  

  return res.status(200).json({
    success: true,
    data: { admin, sessions },
  });
}

/* ======================================================
   DELETE /api/admin/session → LOGOUT
====================================================== */
export async function deleteAdminSessionHandler(
  _req: Request,
  res: Response
) {
  const sessionId = res.locals.admin?.session;

  if (sessionId) {
    await AdminSessionModel.findByIdAndUpdate(sessionId, {
      valid: false,
    });
  }

  res.clearCookie("adminAccessToken");

  return res.status(200).json({
    success: true,
    message: "Admin logged out",
  });
}
