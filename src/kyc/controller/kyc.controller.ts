import { Request, Response } from "express";
import { uploadfile } from "../../utils/upload";
import kycmodel from "../models/kyc.models";
import mongoose from "mongoose";
import { sendMail } from "../../utils/mails/sendmail";
import config from "config";

/* ======================================================
   USER: UPLOAD KYC (FIRST TIME)
====================================================== */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const {
      acountholdername,
      ifsc_code,
      brancname,
      acount_no
    } = req.body;

  
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    if (!acountholdername || !ifsc_code || !brancname || !acount_no) {
      return res.status(400).json({
        msg: "All bank details are required"
      });
    }

  
    const existUser = await kycmodel.findOne({ userid: user._id });
    if (existUser) {
      return res.status(400).json({
        msg: "KYC already uploaded. You cannot upload again."
      });
    }

    
    if (!req.files || typeof req.files !== "object") {
      return res.status(400).json({ msg: "Files are required" });
    }

    const files = req.files as Record<string, Express.Multer.File[]>;

    const adharaFile = files.adhara_img?.[0];
    const panFile = files.pan_img?.[0];
    const bankpassbookFile = files.bankpassbook?.[0];

    if (!adharaFile || !panFile || !bankpassbookFile) {
      return res.status(400).json({
        msg: "Aadhar, PAN, and Bank Passbook files are required"
      });
    }

  
    const [adharaUpload, panUpload, bankUpload] = await Promise.all([
      uploadfile(adharaFile.buffer, "kyc"),
      uploadfile(panFile.buffer, "kyc"),
      uploadfile(bankpassbookFile.buffer, "kyc")
    ]);

    if (!adharaUpload?.url || !panUpload?.url || !bankUpload?.url) {
      return res.status(500).json({ msg: "File upload failed" });
    }

  
    const kycData = await kycmodel.create({
      userid: user._id,
      acountholdername,
      ifsc_code,
      brancname,
      acount_no,
      adhara_img: adharaUpload.url,
      pan_img: panUpload.url,
      bankpassbook: bankUpload.url,
      status: "pending"
    });

    Promise.allSettled([
      user.email &&
        sendMail({
          to: user.email,
          subject: "KYC Upload Confirmation",
          html: `
            <p>Your KYC has been uploaded successfully.<br/>
            Our verification team will review your submission shortly.</p>
          `
        }),
      sendMail({
        to: config.get<string>("ADMIN_EMAIL"),
        subject: "New KYC Submission Alert",
        html: `<p>${user.name} uploaded new KYC documents.</p>`
      })
    ]).catch(err => console.error("Email error:", err));

    return res.status(201).json({
      message: "KYC uploaded successfully",
      data: kycData
    });
  } catch (error: any) {
    console.error("Error uploading KYC:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
;

/* ======================================================
   USER: UPDATE OWN KYC (RE-UPLOAD DOCUMENTS)
====================================================== */
export const updatekyc = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (!user || !user._id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const existingKyc = await kycmodel.findOne({ userid: user._id });
    if (!existingKyc) {
      return res.status(404).json({ msg: "No existing KYC found" });
    }

    if (!req.files) {
      return res.status(400).json({ message: "No files provided for update" });
    }

    const files = req.files as Record<string, Express.Multer.File[]>;
    const updatedimg: Partial<{ adhara_img: string; pan_img: string }> = {};

    const [adharaUpload, panUpload] = await Promise.all([
      files.adhara_img?.[0]
        ? uploadfile(files.adhara_img[0].buffer, "kyc")
        : null,
      files.pan_img?.[0]
        ? uploadfile(files.pan_img[0].buffer, "kyc")
        : null,
    ]);

    if (adharaUpload?.url) updatedimg.adhara_img = adharaUpload.url;
    if (panUpload?.url) updatedimg.pan_img = panUpload.url;

    const updatedKyc = await kycmodel.findOneAndUpdate(
      { userid: user._id },
      {
        ...updatedimg,
        status: "pending",
        updatedAt: new Date(),

      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "KYC updated successfully",
      data: updatedKyc,
    });

    // Async emails
    Promise.allSettled([
      user.email &&
        sendMail({
          to: user.email,
          subject: "KYC Updated Successfully",
          html: `<p>Your KYC documents were updated and are under review.</p>`,
        }),
      sendMail({
        to: config.get<string>("ADMIN_EMAIL"),
        subject: "KYC Update Notification",
        html: `<p>${user.name} updated their KYC documents.</p>`,
      }),
    ]);
  } catch (err: any) {
    console.error("Error updating KYC:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update KYC",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN: UPDATE KYC STATUS (APPROVE / REJECT)
====================================================== */


export const updateKycStatus = async (req: Request, res: Response) => {
  try {
    const { userid } = req.params;
    const { status,adminComment } = req.body;

    
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid KYC status" });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Update KYC using userid
    const updatedKyc = await kycmodel.findOneAndUpdate(
      { userid }, // key change
      {
        status,
        adminComment,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedKyc) {
      return res.status(404).json({ message: "KYC record not found for this user" });
    }

    return res.status(200).json({
      success: true,
      message: "KYC status updated successfully",
      data: updatedKyc,
    });
  } catch (error: any) {
    console.error("Admin KYC update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update KYC status",
      error: error.message,
    });
  }
};



export const getKycdetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User ID" });
    }

    // Find KYC by userid field
    const kyc = await kycmodel
      .findOne({ userid: userId, isActive: true })
      .populate({
        path: "userid",
        select: "name mobno memId",
      });

    if (!kyc) {
      return res.status(404).json({
        msg: "KYC not found for this user",
      });
    }

    return res.status(200).json({
      msg: "KYC details fetched successfully",
      data: kyc,
    });
  } catch (error) {
    console.error("Get KYC by userId error:", error);
    return res.status(500).json({
      msg: "Server error",
      error,
    });
  }
};