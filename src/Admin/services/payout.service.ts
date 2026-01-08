import UserModel from "../../User/models/user.model";
import kycmodel from "../../kyc/models/kyc.models";

export async function payout() {
  
  const users = await UserModel.find({
    totalIncome: { $gt: 500 },
    isActive: true
  }).lean(); 
  if (!users.length) return [];

  
  const result = await Promise.all(
    users.map(async (user) => {
      const kyc = await kycmodel.findOne({
        userid: user._id,
        isActive: true
      }).lean();

    if (!kyc) return null;

      return {
        user,
        kyc: kyc || null
      };
    })
  );

return result.filter(item => item);
}


