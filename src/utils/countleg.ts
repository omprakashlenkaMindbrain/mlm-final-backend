import UserModel from "../User/models/user.model";

/**
 * Recursively counts total downline members under a leg
 * @param memId - Member ID (leftLeg or rightLeg)
 * @returns total count including all descendants
 */
export async function countLeg(memId: string | null): Promise<number> {
  // base case
  if (!memId) return 0;

  // find user by memId
  const user = await UserModel.findOne({ memId }).lean();
  if (!user) return 0;

  // recursive count
  const leftCount = await countLeg(user.leftLeg ?? null);
  const rightCount = await countLeg(user.rightLeg ?? null);
  

  // +1 = count this member
  return 1 + leftCount + rightCount;
}
