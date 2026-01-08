import UserModel from "../User/models/user.model";

function randDigits(digits: number): string {
  const max = 10 ** digits;
  const num = Math.floor(Math.random() * max);
  return num.toString().padStart(digits, "0");
}

export async function generateReferralCode(): Promise<string> {
  const prefix = "BLO";
  const totalUsers = await UserModel.countDocuments();
  const userNumber = totalUsers + 1;

  let referralCode = "";
  let exists = true;

  while (exists) {
    const randomPart = randDigits(5);
    referralCode = `${prefix}${userNumber}${randomPart}`;

    // Check if it exists in User.memId
    exists = await UserModel.exists({ memId: referralCode })?true:false;
  }

  return referralCode;
}