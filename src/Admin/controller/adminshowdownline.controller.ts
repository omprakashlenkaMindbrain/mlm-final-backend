import { Request, Response } from "express";
import UserModel from "../../User/models/user.model";
import { showdownline } from "../services/admin.showdownline.service";
 
export const showDownlineController = async (
  req: Request,
  res: Response
) => {
  try {
    let memId  = req.query.memId as string | undefined;
   if (!memId) {
      const rootUser = await UserModel.findOne().sort({ _id: 1 }) .lean();
 
      if (!rootUser) {
        return res.status(404).json({
          success: false,
          message: "Root user not found",
        });
      }
 
      memId = rootUser.memId;
    }
 
    const data = await showdownline(memId);
 
    return res.status(200).json({
      success: true,
      message: "Downline fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Downline error:", error);
 
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
 