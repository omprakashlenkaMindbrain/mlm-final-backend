import mongoose from "mongoose";

export interface IPlan extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  plan_name: "ibo" | "silver ibo" | "gold ibo" | "star ibo";
  payment_mode: "upi" | "bank";
  payment_ss: string;
  status: "pending" | "approved" | "rejected";
  adminComment?: string;
  bv: number;
  isActive:boolean
}

const planSchema = new mongoose.Schema<IPlan>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan_name: {
      type: String,
      required: true,
      enum: ["ibo", "silver ibo", "gold ibo", "star ibo"],
    },
    payment_mode: {
      type: String,
      required: true,
      enum: ["upi", "bank"],
      default: "upi",
    },
    payment_ss: {
      type: String,
      required: true, // assuming screenshot/proof is always needed
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: "",
    },
    bv: {
      type: Number,
      required: true,
    },
    isActive:{
      type:Boolean,
      default:true
    }
  },
  { timestamps: true }
);

export const planmodel = mongoose.model<IPlan>("plan", planSchema);