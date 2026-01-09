import { Request, Response } from "express";
import IncomeHistory from "../Admin/models/admin.incomehistory";

export const incomehistory = async (req: Request, res: Response) => {
  const userId = req.params.userId?.trim();

  const history = await IncomeHistory.find({ userId }).sort({ createdAt: -1 });

  if (history.length === 0) {
    return res.status(200).json({
      success: true,
      data: [{
        userId,
        income: 0,
        netlefttotal: 0,
        netrighttotal: 0,
        totalleftuse: 0,
        totalrightuse: 0,
        remark: "No income history yet",
        status: true,
      }],
    });
  }

  return res.status(200).json({ success: true, data: history });
};
