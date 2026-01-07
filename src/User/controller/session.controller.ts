import config from "config";
import { Request, Response } from "express";
import { omit } from "lodash";

import kycmodel from "../../kyc/models/kyc.models";
import { planmodel } from "../../plan/model/plan.model";
import { signJwt } from "../../utils/jwt.utils";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";

import { calculateLegBV } from "../../utils/propagateBvtoUpline";
import { countLeg } from "../../utils/countleg";

import {
  createSession,
  findSessions,
} from "../services/session.service";
import { validatePassword } from "../services/user.service";

/* ======================================================
   POST /api/session  → LOGIN
====================================================== */
export async function createUserSessionHandler(req: Request, res: Response) {
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid mobile number or password",
    });
  }

  const session = await createSession(
    user._id.toString(),
    req.get("user-agent") || ""
  );

  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get("accessTokenTtl") }
  );

  const refreshToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get("refreshTokenTtl") }
  );

  // 🔥 FIXED COOKIES (CROSS-SITE SAFE)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,        // REQUIRED when sameSite = none
    sameSite: "none",    // 🔥 THIS FIXES 401
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",    // 🔥 THIS FIXES 401
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
  });
}

/* ======================================================
   GET /api/session  → GET LOGGED-IN USER
====================================================== */
export async function getUserSessionsHandler(
  _req: Request,
  res: Response
) {
  try {
    const userId = res.locals.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const sessions = await findSessions({
      user: userId,
      valid: true,
    });

    const user = omit(
      await UserModel.findById(userId).lean(),
      "password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [kyc, plan] = await Promise.all([
      kycmodel
        .findOne({ userid: userId }) 
        .select("adhara_img pan_img status")
        .lean(),
      planmodel
        .findOne({ userId })
        .select("plan_name status bv adminComment payment_ss")
        .lean(),
    ]);

    const totalLeft = await countLeg(user.leftLeg || null);
    const totalRight = await countLeg(user.rightLeg || null);

    const totalLeftBV = await calculateLegBV(user.leftLeg || null);
    const totalRightBV = await calculateLegBV(user.rightLeg || null);

    await UserModel.updateOne(
      { _id: userId },
      {
        totalLeft,
        totalRight,
        totalleftbv: totalLeftBV,
        totalrightbv: totalRightBV,
      }
    );

    const selfBV =
      plan && plan.status === "approved" ? plan.bv : 0;

      const netLeft = totalLeftBV - (user.leftusetotal ?? 0);
      const netRight = totalRightBV - (user.rightusetotal ?? 0);
      const matchedBV = user.matchedBV
      console.log(matchedBV)


    const fullUser = {
      ...omit(user, [
        "totalLeft",
        "totalRight",
        "totalleftbv",
        "totalrightbv",
      ]),
      totalLeft,
      totalRight,
      totalleftbv: totalLeftBV,
      totalrightbv: totalRightBV,
      matchedBV: matchedBV,
      totalIncome: user.totalIncome ?? 0,
      totalwithdrawincome: user.totalIncome ?? 0,
      netleftusetotal:netLeft,
      netrighttotal:netRight,
      selfBV,
      kyc: kyc || null,
      plan: plan || null,
    };

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: {
        user: fullUser,
        sessions,
      },
    });
  } catch (err) {
    console.error("Session fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/* ======================================================
   DELETE /api/session  → LOGOUT
====================================================== */
export async function deleteSessionHandler(
  _req: Request,
  res: Response
) {
  const sessionId = res.locals.user?.session;

  if (sessionId) {
    await SessionModel.findByIdAndDelete(sessionId);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}