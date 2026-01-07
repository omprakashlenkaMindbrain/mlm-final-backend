import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { verifyJwt } from "../../utils/jwt.utils";
import { findSessions } from "../services/session.service";
 
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.accessToken;
 
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
 
  const { decode, expired } = verifyJwt<{ session: string }>(token);
 
  if (!decode) {
    return res.status(401).json({
      message: expired ? "Token expired" : "Invalid token",
    });
  }
 
  const sessions = await findSessions({
    _id: new mongoose.Types.ObjectId(decode.session),
    valid: true,
  });
 
  if (!sessions || sessions.length === 0) {
    return res.status(401).json({ message: "Session expired" });
  }
 
  const session = sessions[0];
 
  res.locals.admin = {
    _id: session.admin,
    session: session._id,
  };
 
  next();
}