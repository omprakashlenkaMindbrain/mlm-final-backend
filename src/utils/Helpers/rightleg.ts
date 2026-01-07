//rightleg
import UserModel from "../../User/models/user.model";

export const placeInRightLeg = async (referrerMemId: string, newMemId: string) => {

  let current = await UserModel.findOne({ memId: referrerMemId });
  if (!current) throw new Error("Invalid referrer");

  while (current?.rightLeg) {
    current = await UserModel.findOne({ memId: current.rightLeg }) as any;
  }

  current!.rightLeg = newMemId;
  await current!.save();

  return current;
};