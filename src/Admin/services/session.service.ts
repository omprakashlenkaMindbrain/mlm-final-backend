import { get } from "lodash";
import config from "config";
import { FilterQuery, UpdateQuery } from "mongoose";
import AdminSessionModel, {
  AdminSessionDocument,
} from "../models/session.model";
import { verifyJwt, signJwt } from "../../utils/jwt.utils";
import { findAdmin } from "./user.service";

/* ======================================================
   CREATE ADMIN SESSION
====================================================== */
export async function createSession(
  adminId: string,
  userAgent: string
) {
  const session = await AdminSessionModel.create({
    admin: adminId,
    userAgent,
    valid: true,
  });

  return session.toJSON();
}

/* ======================================================
   FIND ADMIN SESSIONS
====================================================== */
export async function findSessions(
  query: FilterQuery<AdminSessionDocument>
) {
  return AdminSessionModel.find(query)
    .sort({ createdAt: -1 })
    .lean();
}

/* ======================================================
   UPDATE SESSION
====================================================== */
export async function updateSession(
  query: FilterQuery<AdminSessionDocument>,
  update: UpdateQuery<AdminSessionDocument>
) {
  return AdminSessionModel.updateOne(query, update);
}

/* ======================================================
   RE-ISSUE ACCESS TOKEN (ADMIN)
====================================================== */
export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const { decode } = verifyJwt(refreshToken);

  if (!decode || !get(decode, "session")) return false;

  const session = await AdminSessionModel.findById(
    get(decode, "session")
  );

  if (!session || !session.valid) return false;

  const admin = await findAdmin({ _id: session.admin });
  if (!admin) return false;

  const accessToken = signJwt(
    {
      ...admin,
      session: session._id,
      role: "admin",
    },
    { expiresIn: config.get("accessTokenTtl") }
  );

  return accessToken;
}
