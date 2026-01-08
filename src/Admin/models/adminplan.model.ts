import mongoose, { Schema, Document } from "mongoose";

/* ======================================================
   INTERFACE
====================================================== */
export interface IAdminPlan extends Document {
  plan_name: string;
  plan_price: number;
  bv: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}


/* ======================================================
   SCHEMA
====================================================== */
const planSchema = new Schema<IAdminPlan>(
  {
    plan_name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // ✅ prevent duplicate plans
      index: true,  // ✅ faster lookup
    },

    plan_price: {
      type: Number,
      required: true,
      min: 0,
    },

    bv: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // ✅ createdAt & updatedAt
    versionKey: false, // ✅ remove __v noise
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

/* ======================================================
   MODEL
====================================================== */
const AdminPlanModel = mongoose.model<IAdminPlan>(
  "AdminPlan",
  planSchema
);

export default AdminPlanModel;
