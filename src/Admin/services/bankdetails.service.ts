import bankdetailsModel from "../models/bankdetails";

export async function createBankdetails(data: any) {
  try {
    const bankdetails = await bankdetailsModel.find();

    if (bankdetails.length >= 1) {
      throw new Error("Bank details already set, you could edit it");
    }

    const bankdetail = await bankdetailsModel.create(data);
    return bankdetail;

  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updatebankdetails(id: string, data: any) {
  // Check if record with the given id exists
  const exist = await bankdetailsModel.findById(id);

  if (!exist) {
    throw new Error("Bank details not found. Please create first.");
  }

  // Update the record and return the updated document
  const updated = await bankdetailsModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true } // returns updated document
  );

  return updated;
}


export async function getbankdetails() {
  return await bankdetailsModel.find()
}
