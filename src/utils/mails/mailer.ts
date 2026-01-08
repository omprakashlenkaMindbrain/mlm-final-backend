import nodemailer from 'nodemailer';

import dontenv from 'dotenv';
dontenv.config();
export const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,  // admin@mybmpl.com
    pass: process.env.EMAIL_PASS,
  },
});