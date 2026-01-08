import { Request, Response } from "express";
import {
  countAutoCollection,
  createAutoCollection,
  getAutoCollection,
  updateAutoCollection,
  deleteAutoCollection
} from "../services/autocollection.service";


export const autocollectioncreate = async (req: Request, res: Response) => {
  try {
    const { admincharges, tds, minamountforincome, income } = req.body;

    const count = await countAutoCollection();

    if (count > 0) {
      return res.status(404).json({
        message: "You cannot create now you can edit"
      });
    }

    if (
      admincharges === undefined ||
      tds === undefined ||
      minamountforincome === undefined ||
      income === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const autocollection = await createAutoCollection(
      admincharges,
      tds,
      minamountforincome,
      income
    );

    return res.status(201).json({
      message: "Auto collection created successfully",
      data: autocollection
    });
  } catch (e: any) {
    return res.status(404).json({
      message: "Server error",
      error: e.message
    });
  }
};


export const autocollectionget = async (req: Request, res: Response) => {
  try {
    const autocollection = await getAutoCollection();

    if (!autocollection) {
      return res.status(404).json({
        message: "Auto collection not found"
      });
    }

    return res.status(200).json({
      message: "Auto collection fetched successfully",
      data: autocollection
    });
  } catch (e: any) {
    return res.status(404).json({
      message: "Server error",
      error: e.message
    });
  }
};


export const autocollectionupdate = async (req: Request, res: Response) => {
  try {
    const { admincharges, tds, minamountforincome, income } = req.body;

    if (
      admincharges === undefined &&
      tds === undefined &&
      minamountforincome === undefined &&
      income === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const autocollection = await updateAutoCollection(
      admincharges,
      tds,
      minamountforincome,
      income
    );

    if (!autocollection) {
      return res.status(404).json({
        message: "Auto collection not found"
      });
    }

    return res.status(200).json({
      message: "Auto collection updated successfully",
      data: autocollection
    });
  } catch (e: any) {
    return res.status(404).json({
      message: "Server error",
      error: e.message
    });
  }
};


export const autocollectiondelete = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteAutoCollection();

    if (!deleted) {
      return res.status(404).json({
        message: "Auto collection not found"
      });
    }

    return res.status(200).json({
      message: "Auto collection deleted successfully"
    });
  } catch (e: any) {
    return res.status(404).json({
      message: "Server error",
      error: e.message
    });
  }
};
