import mongoose, { Schema, Document } from "mongoose";

export enum PayoutStatus {
  success = "success",
  pending = "pending",
}

export interface IPayoutHistory extends Document {
  userId: mongoose.Types.ObjectId;
  payoutAmount: number;
  remark?: string;
  status: PayoutStatus;
  date: Date;
}

const PayoutHistorySchema = new Schema<IPayoutHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payoutAmount: {
      type: Number,
      required: true,
    },
    remark: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.pending,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const PayoutHistoryModel = mongoose.model<IPayoutHistory>(
  "PayoutHistory",
  PayoutHistorySchema
);
