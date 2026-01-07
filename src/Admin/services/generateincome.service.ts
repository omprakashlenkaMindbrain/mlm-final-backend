import UserModel from "../../User/models/user.model";
import { runMatchingForUser } from "../../utils/incomegenerate";
import { UserDocument } from "../../User/models/user.model";

export const generateIncomeForAllUsers = async () => {
  const users:UserDocument[] = await UserModel.find({ isActive: true });
 

  const results = [];
 

  //  CLASSIC FOR LOOP
  for (let i = 0; i < users.length; i++) {

    const user = users[i];
  
    const result = await runMatchingForUser(user._id.toString());
    

    if (result) {
      results.push(result);
    }
  }

  return {
    totalUsers: users.length,
    generatedAt: new Date(),
    results
  };
};
