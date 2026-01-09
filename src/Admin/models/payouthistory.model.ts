import mongoose, { Schema, Document } from "mongoose";

export enum PayoutStatus {
  SUCCESS = "success",
  PENDING = "pending",
}

export interface IPayoutHistory extends Document {
  userId: mongoose.Types.ObjectId;
  payoutAmount: number;
  tds: number;
  adminCharges: number;
  remark?: string;
  status: PayoutStatus;
  payoutDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutHistorySchema = new Schema<IPayoutHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    payoutAmount: {
      type: Number,
      required: true,
    },

    tds: {
      type: Number,
      required: true,
      default: 0,
    },

    adminCharges: {
      type: Number,
      required: true,
      default: 0,
    },

    remark: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
    },

    payoutDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PayoutHistoryModel = mongoose.model<IPayoutHistory>(
  "PayoutHistory",
  PayoutHistorySchema
);
