import UserModel from "../User/models/user.model";
import { planmodel } from "../plan/model/plan.model";

export async function calculateLegBV(memId: string | null): Promise<number> {
  if (!memId) return 0;

  const user = await UserModel.findOne({ memId }).lean();
  if (!user) return 0;

  const plan = await planmodel.findOne({ userId: user._id }).lean();
  
  
  const selfBV = plan?.status === "approved" ? plan.bv : 0;
  const leftBV = await calculateLegBV(user.leftLeg || null);
  const rightBV = await calculateLegBV(user.rightLeg || null);

  return selfBV + leftBV + rightBV;
}
