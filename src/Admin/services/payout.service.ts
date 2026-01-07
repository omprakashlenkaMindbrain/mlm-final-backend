import UserModel from "../../User/models/user.model";

export async function payout(){
   const user = await UserModel.findOne({
  totalincome: { $gt: 500 }
});
return user
}