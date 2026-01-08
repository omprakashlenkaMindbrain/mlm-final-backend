import mongoose, { Document } from "mongoose";

export interface IIncomeHistory extends Document {
  userId: mongoose.Types.ObjectId;
  matchedBV: number;
  income: number;
  netlefttotal: number;
  netrighttotal: number;
  totalleftuse:number;
  totalrightuse:number
  remark: string;
  
  status:boolean
  createdAt: Date;
}

const incomeHistorySchema = new mongoose.Schema<IIncomeHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    income:{
        type:Number
    },
    remark: {
      type: String,
     
    },
    netlefttotal:{
        type:Number
    },
    netrighttotal:{
         type:Number
    },
    totalleftuse:{
         type:Number
    },
    totalrightuse:{
      type:Number 
    },
   
    },

  
  { timestamps: true }
);

export default mongoose.model<IIncomeHistory>(
  "IncomeHistory",
  incomeHistorySchema
);
