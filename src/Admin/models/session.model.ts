import mongoose, { Document, Schema } from "mongoose";

/* ======================================================
   ADMIN SESSION INTERFACE
====================================================== */
export interface AdminSessionDocument extends Document {
  admin: mongoose.Types.ObjectId;
  valid: boolean;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ======================================================
   ADMIN SESSION SCHEMA
====================================================== */
const AdminSessionSchema = new Schema<AdminSessionDocument>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin", // ✅ MUST match Admin model name
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   MODEL
====================================================== */
const AdminSessionModel = mongoose.model<AdminSessionDocument>(
  "AdminSession",
  AdminSessionSchema
);

export default AdminSessionModel;
