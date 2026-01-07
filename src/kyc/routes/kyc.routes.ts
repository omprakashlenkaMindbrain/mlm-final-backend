import express from "express";
import { requireUser } from "../../User/middlewares/requiredUser";
import { uploadHandler } from "../../utils/MulterErrorHandler";
import { updatekyc, uploadFile } from "../controller/kyc.controller";

const kycrouter = express.Router();

kycrouter.post(
  "/upload",
  requireUser,
  uploadHandler,
  uploadFile
);

kycrouter.put(
  "/update",
  requireUser,
  uploadHandler,
  updatekyc
);

export default kycrouter;
