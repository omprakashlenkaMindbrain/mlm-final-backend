import { planmodel } from "../../plan/model/plan.model";
import UserModel from "../../User/models/user.model";
import kycmodel from "../../kyc/models/kyc.models";

export async function payout() {
  //  Users with income ≥ 500
  const users = await UserModel.find({
    totalIncome: { $gte: 500 },
    isActive: true,
  })

  if (!users.length) return [];

  //  Active + approved plans
  const activePlans = await planmodel.find({
    status: "approved",
    isActive: true,
  }).select("userId");

  const activePlanUserIds = new Set(
    activePlans.map(p => p.userId.toString())
  );

  //  Approved KYC (with bank details)
  const approvedKycs = await kycmodel.find({
    status: "approved",
  }).select("userid acount_no acountholdername");

  const approvedKycMap = new Map<
    string,
    { account_no: string; account_holder_name: string }
  >();

  approvedKycs.forEach(k => {
    approvedKycMap.set(k.userid.toString(), {
      account_no: k.acount_no,
      account_holder_name: k.acountholdername,
    });
  });

  const payoutUsers: any[] = [];

  //  Validate users
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userId = user._id.toString();

    //  Plan check
    if (!activePlanUserIds.has(userId)) continue;

    //  KYC check + get bank details
    const kycData = approvedKycMap.get(userId);
    if (!kycData) continue;

    //  Direct joins (binary)
    const directMemIds = [user.leftLeg, user.rightLeg].filter(Boolean);
    if (directMemIds.length < 2) continue;

    //  Fetch direct users
    const directUsers = await UserModel.find({
      memId: { $in: directMemIds },
      isActive: true,
    }).select("_id");

    if (directUsers.length < 2) continue;

    //  Direct users must have active plans
    const activeDirectPlans = await planmodel.countDocuments({
      userId: { $in: directUsers.map(u => u._id) },
      status: "approved",
      isActive: true,
    });

    if (activeDirectPlans < 2) continue;

    //  Eligible payout user WITH BANK DETAILS
    payoutUsers.push({
      userId: user._id,
      account_no: kycData.account_no,
      account_holder_name: kycData.account_holder_name,
      users
      });
  }

  return payoutUsers;
}
