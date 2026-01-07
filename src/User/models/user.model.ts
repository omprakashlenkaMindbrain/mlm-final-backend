import bcrypt from "bcrypt";
import config from "config";
import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  mobno: string;
  name: string;
  password: string;
  memId: string;
  trackingId?: string | null;
  referralCount: number;
  leftLeg?: string | null;
  rightLeg?: string | null;

  totalLeft: number;
  totalRight: number;

  // BV
  totalleftbv: number;
  totalrightbv: number;
  leftusetotal: number;
  rightusetotal: number;
  netlefttotal: number;
  netrighttotal: number;
  matchedBV: number;
   recentIncome:number
  totalIncome: number;
  totalwithdrawincome: number;
  netincome: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    mobno: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    password: { type: String, required: true },

    memId: { type: String, required: true, unique: true }, 
    trackingId: { type: String, default: null },

    referralCount: { type: Number, default: 0 },

    leftLeg: {
      type: String,
      ref: "User",
      default: null,
      validate: {
        validator: (v: string | null) => v === null || /^BLO\d+$/.test(v),
        message: "Invalid id format. Expected BLO + digits (e.g., BLO0001)",
      },
    },
    rightLeg: {
      type: String,
      ref: "User",
      default: null,
      validate: {
        validator: (v: string | null) => v === null || /^BLO\d+$/.test(v),
        message: "Invalid id format. Expected BLO + digits (e.g., BLO0001)",
      },
    },

    totalLeft: { type: Number, default: 0 },
    totalRight: { type: Number, default: 0 },

    totalleftbv: { type: Number, default: 0 },
    totalrightbv: { type: Number, default: 0 },
    leftusetotal: { type: Number, default: 0 },
    rightusetotal: { type: Number, default: 0 },
    netlefttotal: { type: Number, default: 0 },
    netrighttotal: { type: Number, default: 0 },
    matchedBV: { type: Number, default: 0 },

    totalIncome: { type: Number, default: 0 },
    recentIncome:{type: Number, default: 0 },
    totalwithdrawincome: { type: Number, default: 0 },
    netincome: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ======================================================
   PASSWORD HASHING (CORRECT)
====================================================== */
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const saltRounds = config.get<number>("saltWorkFactor") || 10;
  user.password = await bcrypt.hash(user.password, saltRounds);
  next();
});

/* ======================================================
   PASSWORD COMPARISON (CORRECT)
====================================================== */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;