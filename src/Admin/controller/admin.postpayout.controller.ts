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
        updatedCount: 0,
      });
    }

    let updatedCount = 0;

    for (const item of payoutUsers) {
      const user = await UserModel.findById(item.userId);

      if (!user) continue;
      if (user.recentIncome <= 0) continue; 

      const recentIncome = user.recentIncome;
      const totalIncome = user.totalIncome || 0;
      const prevWithdrawIncome = user.totalwithdrawincome || 0;

    
      const adminCharge = autoCollection.admincharges;
      const tds = autoCollection.tds;


      
      await PayoutHistoryModel.create(
        [
          {
            userId: user._id,
            payoutAmount: user.recentIncome,
            remark: `Admin: ${adminCharge}% | TDS: ${tds}%`,
          },
        ],
      );

    
      user.totalwithdrawincome =
        prevWithdrawIncome + recentIncome;
      user.recentIncome = 0;
      user.netincome =
        user.totalwithdrawincome - totalIncome;

      await user.save();
      updatedCount++;
    }

  

    return res.status(200).json({
      success: true,
      message: "Payout processed successfully",
      autoCollection,
      payoutUsers,
      updatedCount,
    });

  } catch (error:any) {

    console.error("Payout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

