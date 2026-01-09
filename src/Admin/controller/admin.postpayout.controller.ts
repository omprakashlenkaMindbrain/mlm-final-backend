import { Request, Response } from "express";
import autocollectionmodel from "../../autocollection/models/autocollection";
import UserModel from "../../User/models/user.model";
import { PayoutHistoryModel } from "../models/payouthistory.model";
import { payout } from "../services/payout.service";

export async function postPayoutController(_req:Request,res: Response) {
  try {
    const autoCollection = await autocollectionmodel.findOne().lean();

    if (!autoCollection) {
      return res.status(400).json({
        success: false,
        message: "Auto collection configuration not found",
      });
    }

    const payoutUsers = await payout();
    console.log(payoutUsers)

    if (!payoutUsers.length) {
      return res.status(200).json({
        success: true,
        message: "No users eligible for payout",
        data: [],
      });
    }

  var responseData: any[] = [];

    for (const item of payoutUsers) {
      const user = await UserModel.findById(item.userId);
      if (!user) continue;

      const recentIncome = Number(user.recentIncome);
      if (recentIncome <= 0) continue;

      const totalIncome = Number(user.totalIncome || 0);
      const totalwithdrawincome = Number(user.totalwithdrawincome || 0);

      
      const adminAmount =autoCollection.admincharges;
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

      
      user.totalwithdrawincome = totalwithdrawincome + recentIncome;
      user.netincome = totalIncome-user.totalwithdrawincome;
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
        }
        
      });
      
    }
    
    return res.status(200).json({
      success: true,
      message: "Payout processed successfully",
      autoCollection,
      payoutUsers,
      responseData
    });
  } catch (error: any) {
    console.error("Payout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
