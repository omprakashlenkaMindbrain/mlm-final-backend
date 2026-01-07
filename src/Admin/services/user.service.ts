import { omit } from "lodash";
import { FilterQuery } from "mongoose";
import AdminModel, { AdminDocument } from "../models/user.model";
import { CreateAdminInput } from "../schema/admin.schema";

/* ======================================================
   CREATE ADMIN USER
====================================================== */
export async function createAdmin(input: CreateAdminInput) {
  const emailExists = await AdminModel.findOne({ email: input.email });
  if (emailExists) {
    throw new Error("Email already registered");
  }

  const mobileExists = await AdminModel.findOne({ mobno: input.mobno });
  if (mobileExists) {
    throw new Error("Mobile number already registered");
  }

  const admin = await AdminModel.create(input);
  return omit(admin.toJSON(), "password");
}

/* ======================================================
   VALIDATE ADMIN LOGIN
   ⚠️ RETURNS FULL DOCUMENT (NOT OMITTED)
====================================================== */
export async function validateAdminPassword({
  mobno,
  password,
}: {
  mobno: string;
  password: string;
}) {
  if (!mobno || !password) return false;

  const admin = await AdminModel.findOne({ mobno });

  if (!admin) return false;

  const isValid = await admin.comparePassword(password);
  if (!isValid) return false;

  // ⬅️ IMPORTANT: return document, NOT omitted object
  return admin;
}

/* ======================================================
   FIND ADMIN (GENERIC)
====================================================== */
export async function findAdmin(
  query: FilterQuery<AdminDocument>
) {
  return AdminModel.findOne(query).lean();
}
