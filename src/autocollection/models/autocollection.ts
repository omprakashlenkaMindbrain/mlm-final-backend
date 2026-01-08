import mongoose, { Document } from 'mongoose'



export interface IautoCollection extends Document {
  admincharges: number;
  tds: number;
  minamountforincome: number;
  income: number;
}

const autocollection = new mongoose.Schema<IautoCollection>(
  {
    admincharges: {
      type: Number,
      required: true,
      default: 0
    },

    tds: {
      type: Number,
      required: true,
      default: 0
    },

    minamountforincome: {
      type: Number,
      required: true,
      default: 0
    },

    income: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

const autocollectionmodel = mongoose.model<IautoCollection>("autocollectionmodel", autocollection);
export default autocollectionmodel;

