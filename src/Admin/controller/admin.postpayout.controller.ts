import { Request, Response } from "express";
import UserModel from "../../User/models/user.model";
import { payout } from "../services/payout.service";
import { PayoutHistoryModel } from "../models/payouthistory.model";
import autocollectionmodel from "../../autocollection/models/autocollection";

export async function postPayoutController(req: Request, res: Response) {
  try {
    const autoCollection = await autocollectionmodel.findOne().lean();

    if (!autoCollection) {
      return res.status(400).json({
        success: false,
        message: "Auto collection configuration not found",
      });
    }

    const payoutUsers = await payout();

    if (!payoutUsers.length) {
      return res.status(200).json({
        success: true,
        message: "No users eligible for payout",
        data: [],
      });
    }

    const responseData: any[] = [];

    for (const item of payoutUsers) {
      const user = await UserModel.findById(item.userId);
      if (!user) continue;

      const recentIncome = Number(user.recentIncome);
      if (recentIncome <= 0) continue;

      const totalIncome = Number(user.totalIncome || 0);
      const totalwithdrawincome = Number(user.totalwithdrawincome || 0);

      
      const adminAmount =
        (recentIncome * autoCollection.admincharges) / 100;
      const tdsAmount =
        (recentIncome * autoCollection.tds) / 100;
      const netPayout = recentIncome - (adminAmount + tdsAmount);

      
      const payoutHistory = await PayoutHistoryModel.create({
        userId: user._id,
        userRecentIncome: recentIncome,
        adminCharges: adminAmount,
        tds: tdsAmount,
        payoutAmount: netPayout,
        remark: `Gross: ${recentIncome} | Admin: ${adminAmount} | TDS: ${tdsAmount}`,
        status: "success",
      });

      
      user.totalwithdrawincome = totalwithdrawincome + netPayout;
      user.netincome = user.totalwithdrawincome + totalIncome;
      user.recentIncome = 0;

      const savedUser = await user.save();

      
      responseData.push({
        user: {
          _id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
          totalwithdrawincome: savedUser.totalwithdrawincome,
          netincome: savedUser.netincome,
        },
        payoutHistory: {
          payoutId: payoutHistory._id,
          grossIncome: recentIncome,
          adminCharges: adminAmount,
          tds: tdsAmount,
          netPayout: netPayout,
          date: payoutHistory.createdAt,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payout processed successfully",
      autoCollection,
      payoutUsers,
      updatedCount,
    });
  } catch (error: any) {
    console.error("Payout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
