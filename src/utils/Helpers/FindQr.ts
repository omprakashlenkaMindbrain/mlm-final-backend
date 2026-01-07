import qrModel from "../../Admin/models/qr.model";


export async function getQrLink() {
  const lastQR = await qrModel.findOne().sort({ createdAt: -1 });
  return lastQR?.qr || null;
}