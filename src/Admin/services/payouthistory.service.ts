import mongoose from "mongoose";
import { PayoutHistoryModel } from "../models/payouthistory.model";


export const getAllPayoutHistoryService = async () => {
  return await PayoutHistoryModel.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

export const getUserPayoutHistoryService = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  return await PayoutHistoryModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};
