import config from "config";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { planmodel } from "../../plan/model/plan.model";
import UserModel from "../../User/models/user.model";
import { getQrLink } from "../../utils/Helpers/FindQr";
import { sendMail } from "../../utils/mails/sendmail";
import { calculateLegBV } from "../../utils/propagateBvtoUpline";

export const updatePlanStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status, adminComment } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: approved, rejected",
      });
    }

    /* ---------------- FETCH USER ---------------- */
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- FIND PLAN ---------------- */
    const plan = await planmodel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan record not found",
      });
    }

    /* ---------------- UPDATE PLAN ---------------- */
    plan.status = status;
    plan.adminComment = adminComment || "";
    await plan.save();

    /* =====================================================
       BV PROPAGATION (FIXED & SAFE VERSION)
       ===================================================== */
    if (status === "approved") {
      try {
        let parentMemId: string | null = user.trackingId || null;
        const visited = new Set<string>(); // Prevent infinite loops

        while (parentMemId && !visited.has(parentMemId)) {
          visited.add(parentMemId);

          const parent = await UserModel.findOne({ memId: parentMemId });
          if (!parent) {
            console.log(`Parent not found for memId: ${parentMemId}`);
            break;
          }

          // Safely calculate BV
          let totalLeftBV = 0;
          let totalRightBV = 0;

          try {
            totalLeftBV = (await calculateLegBV(parent.leftLeg || null)) || 0;
            totalRightBV = (await calculateLegBV(parent.rightLeg || null)) || 0;
          } catch (bvError) {
            console.error(`Error calculating BV for parent ${parent.memId}:`, bvError);
            // Continue with 0 instead of crashing
          }

          // Update parent BV
          await UserModel.updateOne(
            { _id: parent._id },
            {
              $set: {
                totalleftbv: totalLeftBV,
                totalrightbv: totalRightBV
              }
            }
          );

          console.log(`Updated BV for ${parent.memId}: Left=${totalLeftBV}, Right=${totalRightBV}`);

          // Move to next parent
          parentMemId = parent.trackingId || null;
        }

        if (parentMemId && visited.has(parentMemId)) {
          console.warn("Circular referral detected, stopping BV propagation");
        }

      } catch (bvError) {
        // Log but don't crash the whole request
        console.error("Error in BV propagation:", bvError);
        // We still consider approval successful even if BV update fails partially
      }
    }

    /* ---------------- EMAIL CONTENT ---------------- */
    const qrCodeUrl = status === "rejected" ? await getQrLink() : null;

    let userMessage = `
      <p>Dear ${user.name || "User"},</p>
      <p>Your payment for the <strong>${plan.plan_name}</strong> plan has been
      <strong>${status.toUpperCase()}</strong>.</p>
    `;

    if (adminComment) {
      userMessage += `<p><strong>Admin Comment:</strong> ${adminComment}</p>`;
    }

    if (status === "rejected" && qrCodeUrl) {
      userMessage += `
        <p>If payment was insufficient, click below to complete the remaining amount:</p>
        <p><a href="${qrCodeUrl}" target="_blank">Complete Payment</a></p>
      `;
    }

    userMessage += `<p>Thank you for using our services.</p>`;

    /* ---------------- SEND EMAILS ---------------- */
    if (user.email) {
      await sendMail({
        to: user.email,
        subject: `Payment Status - ${status.toUpperCase()}`,
        html: userMessage,
      });
    }

    await sendMail({
      to: config.get<string>("ADMIN_EMAIL"),
      subject: "Payment Status Updated",
      html: `
        <h3>Payment Status Updated</h3>
        <p><strong>User:</strong> ${user.name}</p>
        <p><strong>Member ID:</strong> ${user.memId}</p>
        <p><strong>Plan:</strong> ${plan.plan_name}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        ${adminComment ? `<p><strong>Comment:</strong> ${adminComment}</p>` : ""}
      `,
    });

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: `Payment ${status} successfully`,
      data: { plan, user }
    });

  } catch (error: any) {
    console.error("Error updating plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
