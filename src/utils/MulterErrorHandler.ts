import { NextFunction, Request, Response } from 'express';
import multer from "multer";
import { uploader } from "../utils/upload"; // your multer setup file

export const uploadHandler = (req:Request, res:Response, next:NextFunction) => {
  uploader.fields([
    { name: "adhara_img", maxCount: 1 },
    { name: "pan_img", maxCount: 1 },
    {name:"bankpassbook",maxCount:1}
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          msg: "File size too large! Max 1 MB per file.",
        });
      }
      // Other multer-related errors
      return res.status(400).json({
        success: false,
        msg: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // Non-multer errors
      return res.status(400).json({
        success: false,
        msg: err.message || "Unexpected upload error",
      });
    }

    // No errors, continue to controller
    next();
  });
};




//handler
//util multer

// Upload handler for ONLY payment_ss
export const uploadPaymentHandler = (req: Request, res: Response, next: NextFunction) => {
  uploader.fields([
    { name: "payment_ss", maxCount: 1 }
  ])(req, res, (err) => {

    if (err instanceof multer.MulterError) {

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          msg: "File too large! Max 1MB allowed.",
        });
      }

      return res.status(400).json({
        success: false,
        msg: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        msg: err.message || "Unexpected upload error",
      });
    }

    next();
  });
};
