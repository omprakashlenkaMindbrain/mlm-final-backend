import { transporter } from "./mailer";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: `"MyBMPL" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Mail send error:", err);
  }
}
