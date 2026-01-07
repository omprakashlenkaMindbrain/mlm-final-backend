//leftleg
import UserModel from "../../User/models/user.model";
export const placeInLeftLeg = async (referrerMemId: string, newMemId: string) => {

  let current = await UserModel.findOne({ memId: referrerMemId });
  if (!current) throw new Error("Invalid referrer");

 // Traverse down left side
  while (current.leftLeg) {
    current = await UserModel.findOne({ memId: current.leftLeg }) as any;
    if (!current) throw new Error("Invalid user in referral chain");
  }

  // Attach here
  current.leftLeg = newMemId;
  await current.save();

  return current;
};