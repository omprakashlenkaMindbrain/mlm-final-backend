import { Request, Response } from "express";
import { getAllPayoutHistoryService, getUserPayoutHistoryService } from "../services/payouthistory.service";
getUserPayoutHistoryService

export const getAllPayoutHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAllPayoutHistoryService();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserPayoutHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const data = await getUserPayoutHistoryService(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
