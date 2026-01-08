import { Request, Response } from "express";
import { generateIncomeForAllUsers } from "../services/generateincome.service";

export const generateIncomeController = async (
  req: Request,
  res: Response
) => {
  try {
  

    const data = await generateIncomeForAllUsers();

  

    return res.status(200).json({
      success: true,
      message: "Income generation completed",
      data
    });
  } catch (error) {
    console.error("Income generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Income generation failed"
    });
  }
};
