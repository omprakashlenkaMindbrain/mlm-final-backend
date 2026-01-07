import { Request, Response } from "express";
import { createBankdetails, getbankdetails, updatebankdetails } from "../services/bankdetails.service";

export const createbankdetailscontroller = async (
  req: Request,
  res: Response
) => {
  try {
    const { account_no, accountholder_name, ifsc_code,bankname } = req.body;

    if (!account_no) {
      return res.status(400).json({ msg: "account no required" });
    }
    if (!accountholder_name) {
      return res.status(400).json({ msg: "accountholder name required" });
    }
    if (!ifsc_code) {
      return res.status(400).json({ msg: "ifsc code required" });
    }
  if(!bankname){
    return res.status(404).json({msg:"bank name required"})
  }
    const data = await createBankdetails(req.body);

    return res.status(200).json({
      success: true,
      msg: "bankdetails create successfully",
      data,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      msg: error.message, 
    });
  }
};

export const updatedbankdetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "id is required",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "At least one field is required to update",
      });
    }

    const updated = await updatebankdetails(id, req.body);

    return res.status(200).json({
      success: true,
      msg: "Bank details updated successfully",
      data: updated,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      msg: error.message, 
    });
  }
};

export const getBankdetails = async(_req:Request,res:Response)=>{
  try {
    const data = await getbankdetails()
    if(!data){
      return res.status(404).json({msg:"bankdetails not found"})
    }
    return res.status(200).json({msg:"bankdetails fetch sucessfully",data})
  } catch (error) {
    return res.status(500).json(error)
  }
}
