import autocollectionmodel from "../models/autocollection";

export const countAutoCollection = async () => {
  return await autocollectionmodel.countDocuments();
};

export const createAutoCollection = async (
  admincharges: number,
  tds: number,
  minamountforincome: number,
  income: number
) => {
  return await autocollectionmodel.create({
    admincharges,
    tds,
    minamountforincome,
    income
  });
};

export const getAutoCollection = async () => {
  return await autocollectionmodel.findOne();
};

export const updateAutoCollection = async (
  admincharges?: number,
  tds?: number,
  minamountforincome?: number,
  income?: number
) => {
  const autocollection = await autocollectionmodel.findOne();

  if (!autocollection) return null;

  if (admincharges !== undefined) {
    autocollection.admincharges = admincharges;
  }

  if (tds !== undefined) {
    autocollection.tds = tds;
  }

  if (minamountforincome !== undefined) {
    autocollection.minamountforincome = minamountforincome;
  }

  if (income !== undefined) {
    autocollection.income = income;
  }

  return await autocollection.save();
};

export const deleteAutoCollection = async () => {
  const autocollection = await autocollectionmodel.findOne();

  if (!autocollection) return null;

  await autocollectionmodel.deleteOne({ _id: autocollection._id });

  return true;
};
