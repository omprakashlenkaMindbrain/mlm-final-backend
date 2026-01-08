import UserModel from "../User/models/user.model";
import adminIncomehistory from "../Admin/models/admin.incomehistory";
import { planmodel } from "../plan/model/plan.model";

export const runMatchingForUser = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return null;

  const MATCHING_PERCENT = 0.1; // 10%

  // TOTAL DOWNLINE BV
  const totalLeftBV = user.totalleftbv ?? 0;
  const totalRightBV = user.totalrightbv ?? 0;

  // TOTAL USED BV
  const leftUsed = user.leftusetotal ?? 0;
  const rightUsed = user.rightusetotal ?? 0;

  // CARRY FORWAD BV OR NET BV
  const netLeft = totalLeftBV - leftUsed;
  const netRight = totalRightBV - rightUsed;
  const matchedBV = Math.min(netLeft, netRight);
  const remarks =
    matchedBV > 0
      ? "Income generated successfully"
      : "Matching not possible yet, carry-forward BV exists"
  

  let incomeGenerated = 0;
  if (matchedBV > 0) {
    incomeGenerated = matchedBV * MATCHING_PERCENT;

    user.matchedBV = matchedBV;
    user.leftusetotal += matchedBV;
    user.rightusetotal += matchedBV;
    user.recentIncome = incomeGenerated;
    user.totalIncome = (user.totalIncome ?? 0) + incomeGenerated;

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          matchedBV: matchedBV,
          recentIncome: incomeGenerated,
        },
        $inc: {
          leftusetotal: matchedBV,
          rightusetotal: matchedBV,
          totalIncome: incomeGenerated,
        },
      },
      { new: true }
    );

  }
  const data = await adminIncomehistory.create({
    userId: user._id,
    matchedBV,
    income: user.totalIncome,
    netlefttotal: netLeft - matchedBV,
    netrighttotal: netRight - matchedBV,
    totalleftuse: user.leftusetotal,
    totalrightuse: user.rightusetotal,
    remark: remarks,
  });





  const name = user.name
  const mob = user.mobno
  const date = user.createdAt

  //  Carry-forward is AUTOMATIC
  return {
    name,
    mob,
    date,
    matchedBV,
    income: incomeGenerated,
    recentIncome: user.recentIncome,
    totalIncome: user.totalIncome ?? 0,
    carryForward: {
      netlefttotal: totalLeftBV - user.leftusetotal,
      netrighttotal: totalRightBV - user.rightusetotal
    },
    message:
      matchedBV > 0
        ? "Income generated successfully"
        : "Matching not possible yet, carry-forward BV exists"
  };

}
