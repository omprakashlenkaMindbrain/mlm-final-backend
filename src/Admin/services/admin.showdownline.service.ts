import UserModel from "../../User/models/user.model";

export async function showdownline(memId:string){
    const user = await UserModel.findOne({memId:memId})
    if(!user){
        throw new Error("user not found")
    }
    let leftUser = null;
let rightUser = null;

if (user.leftLeg) {
  leftUser = await UserModel.findOne({ memId: user.leftLeg }).lean();
}

if (user.rightLeg) {
  rightUser = await UserModel.findOne({ memId: user.rightLeg }).lean();
}
  return {leftUser,rightUser,user}
}