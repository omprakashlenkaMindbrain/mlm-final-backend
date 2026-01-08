import UserModel from "../../User/models/user.model";
import { runMatchingForUser } from "../../utils/incomegenerate";
import { UserDocument } from "../../User/models/user.model";
import { IPlan, planmodel } from "../../plan/model/plan.model";
import log from "../../utils/logger";

export const generateIncomeForAllUsers = async () => {
  // 1. Get all APPROVED + ACTIVE plans
  const approvedPlans: IPlan[] = await planmodel.find({
    status: "approved",
    isActive: true,
  });

  const results: any[] = [];

  // 2. Loop through approved plans
  for (let i = 0; i < approvedPlans.length; i++) {
    const plan = approvedPlans[i];

    // 3. Fetch corresponding active user
    const user: UserDocument | null = await UserModel.findOne({
      _id: plan.userId,
      isActive: true,
    });

    if (!user) continue;
    log.info("users"+user)
    // 4. Run matching logic
    const result = await runMatchingForUser(user._id.toString());

    if (result) {
      results.push({
        userId: user._id,
        memId: user.memId,
        planName: plan.plan_name,
        planBV: plan.bv,
        income: result,
      });
    }
  }

  return {
    totalApprovedPlans: approvedPlans.length,
    generatedAt: new Date(),
    results,
  };
};