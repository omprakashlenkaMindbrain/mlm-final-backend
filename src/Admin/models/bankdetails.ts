import mongoose,{Document} from "mongoose";
import { required } from "zod/v4/core/util.cjs";

const Schema = mongoose.Schema;


export interface bankaaccountDocument extends Document{
    account_no?:Number,
    ifsc_code?:string,
    accountholder_name?:string
    bankname:string
    createdAt:Date,
    updatedAt:Date
}

const bankdetailsSchema = new Schema(
  {
    account_no: {
      type: Number,
      required: true,
      unique:true
    },
    ifsc_code: {
      type: String,
      required: true,
      unique:true
    },
    accountholder_name: {
      type: String,
      required: true,
      unique:true
    },
    bankname:{
      type:String,
      required:true,
    }
  },
  {
    timestamps: true,
  }
);


 const bankdetailsModel = mongoose.model<bankaaccountDocument>("bankdetails",bankdetailsSchema)

 export default bankdetailsModel;
