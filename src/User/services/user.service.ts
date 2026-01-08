import { omit } from "lodash";
import { FilterQuery } from "mongoose";
import { getLastUserInLeg } from "../../utils/Helpers/lookup";
import { generateReferralCode } from "../../utils/refer";
import UserModel, { UserDocument } from "../models/user.model";
import { CreateUserInput } from "../schema/user.schema";
import { UpdateUserInput } from "../schema/user.update.schema";
import { placeInLeftLeg } from "../../utils/Helpers/leftleg";
import { placeInRightLeg } from "../../utils/Helpers/rightleg";
import { planmodel } from "../../plan/model/plan.model";
import { IPlan } from "../../plan/model/plan.model";

//import kycmodel from "../models/";
//import paymodel from "../"; //update these fields

//controller
export async function createUser(input: CreateUserInput) {
  try {
    // Check email
    const emailExists = await UserModel.findOne({ email: input.email });
    if (emailExists) throw new Error("Email already registered");

    // Check mobile number
    const mobileExists = await UserModel.findOne({ mobno: input.mobno });
    if (mobileExists) throw new Error("Mobile number already registered");

    const userCount = await UserModel.countDocuments();

    // Generate memId before saving
    const memId = await generateReferralCode();
    let referrer = null;
    let trackingId: string | null = null;

    if (userCount === 0) {
      // First user — no placement
      trackingId = null;
    } else {
      if (!input.trackingId) {
        throw new Error("Tracking ID is required");
      }

      // Find referrer
      referrer = await UserModel.findOne({ memId: input.trackingId });
      if (!referrer) throw new Error("Invalid tracking ID");

      trackingId = referrer.memId;

      if (!input.legPosition) {
        throw new Error("Leg (left/right) is required");
      }

      // Perform placement before saving user
      if (input.legPosition.toUpperCase() === "LEFT") {
        await placeInLeftLeg(referrer.memId, memId);
      } else if (input.legPosition.toUpperCase() === "RIGHT") {
        await placeInRightLeg(referrer.memId, memId);
      }
    }

    //performing lookup placement

    // Now create the user in DB
    const newUser = await UserModel.create({
      name: input.name,
      email: input.email,
      mobno: input.mobno,
      password: input.password,
      memId,
      trackingId,
      referralCount: 0,
    });

    // Increment referrer count
    if (referrer) {
      await UserModel.updateOne(
        { memId: referrer.memId },
        { $inc: { referralCount: 1 } }
      );
    }

    return omit(newUser.toJSON(), ["password"]);
  } catch (e: any) {
    throw new Error(e.message || "Failed to create user");
  }
}

export async function createUser2(input: CreateUserInput) {
  try {
    // Duplicate check
    const emailExists = await UserModel.findOne({ email: input.email });
    if (emailExists) throw new Error("Email already registered");

    const mobileExists = await UserModel.findOne({ mobno: input.mobno });
    if (mobileExists) throw new Error("Mobile number already registered");

    const userCount = await UserModel.countDocuments();

    const memId = await generateReferralCode();
    let trackingId: string | null = null;
    let referrer = null;

    // FIRST USER
    if (userCount === 0) {
      const newUser = await UserModel.create({
        name: input.name,
        email: input.email,
        mobno: input.mobno,
        password: input.password,
        memId,
        trackingId: null,
        referralCount: 0,
      });

      return omit(newUser.toJSON(), ["password"]);
    }

    // From 2nd user onwards ↓
    if (!input.trackingId) {
      throw new Error("Tracking ID is required");
    }

    referrer = await UserModel.findOne({ memId: input.trackingId });
    if (!referrer) throw new Error("Invalid Tracking ID");

    trackingId = referrer.memId;

    if (!input.legPosition) {
      throw new Error("Leg (left/right) is required");
    }

    const lastNode = await getLastUserInLeg(
      referrer.memId,
      input.legPosition.toUpperCase() as "LEFT" | "RIGHT"
    );

    if (!lastNode) {
      throw new Error("Placement failed – invalid structure");
    }

    const legField =
      input.legPosition.toUpperCase() === "LEFT" ? "leftLeg" : "rightLeg";

    // Update last node
    await UserModel.updateOne(
      { memId: lastNode.memId },
      { $set: { [legField]: memId } }
    );

    // Create new user
    const newUser = await UserModel.create({
      name: input.name,
      email: input.email,
      mobno: input.mobno,
      password: input.password,
      memId,
      trackingId,
      referralCount: 0,
    });

    // Increase referrer counter
    await UserModel.updateOne(
      { memId: referrer.memId },
      { $inc: { referralCount: 1 } }
    );

    return omit(newUser.toJSON(), ["password"]);
  } catch (err: any) {
    throw new Error(err.message || "Failed to create user");
  }
}

export async function validatePassword({
  mobno,
  password,
}: {
  mobno: string;
  password: string;
}) {
  const user = await UserModel.findOne({ mobno });

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return omit(user.toJSON(), "password");
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}

export async function updateUser(userId: string, updates: UpdateUserInput) {
  try {
    const user = await UserModel.findById(userId);
    // const userKyc = await kycmodel.findById(userId);
    // const userPlan = await planmodel.findById(userId);
    if (!user) {
      return null;
    }

    if (updates.name) {
      user.name = updates.name;
    }

    if (updates.email) {
      user.email = updates.email;
    }

    if (updates.mobno) {
      user.mobno = updates.mobno;
    }

    // if (updates.adhara_img) {
    //   user.adhara_img = updates.adhara_img;
    // }

    // if (updates.pan_img) {
    //   user.pan_img = updates.pan_img;
    // }

    // if (updates.plan_name) {
    //   user.plan_name = updates.plan_name;
    // }

    // if (updates.payment_cs) {
    //   user.payment_cs = updates.payment_cs;
    // }

    await user.save();

    return omit(user.toObject(), ["password"]);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

///

export interface DownlineNode {
  memId: string;
  name: string;
  leftLeg: DownlineNode | null;
  rightLeg: DownlineNode | null;
  mobno: string;
  email: string;
  plan: string|null;
  trackingId:string|null
  // totalLeft:number
  // totalRight:number
  }

async function buildTree(memId: string): Promise<DownlineNode | null> {
  const user = await UserModel.findOne({ memId }).lean();
  if (!user) return null;
 const plan: IPlan | null = await planmodel.findOne({ userId: user._id }).lean();
  const left = user.leftLeg
    ? // ? await buildTree(user.leftLeg as unknown as mongoose.Types.ObjectId)
      await buildTree(user.leftLeg)
    : null;

  const right = user.rightLeg
    ? // ? await buildTree(user.rightLeg as unknown as mongoose.Types.ObjectId)
      await buildTree(user.rightLeg)
    : null;
      //  const totalleftleg = await countLeg(user.leftLeg || null)
       //  const totalrightleg = await countLeg(user.rightLeg || null)
  

    //   await UserModel.updateOne(
    //   { _id: user._id},
    //   {
    //     totalLeft:totalleftleg,
    //     totalRight:totalrightleg,
    //   }
    // );
    return {
    memId: user.memId,
    name: user.name,
    mobno: user.mobno,
    email: user.email,
    plan: plan ? plan.plan_name : null,
    leftLeg: left,
    rightLeg: right,
    trackingId: user.trackingId ?? null,
    // totalLeft:totalleftleg,
    // totalRight:totalrightleg
    
  };
}

export async function getDownlineTree(
  memId: string
): Promise<DownlineNode | null> {
  const user = await UserModel.findOne({ memId }).lean();
  if (!user) throw new Error("User not found");

  return buildTree(memId);
}
