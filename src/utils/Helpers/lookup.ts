import UserModel from "../../User/models/user.model";

export const getLastUserInLeg = async (
  referrerMemId: string,
  leg: "LEFT" | "RIGHT"
) => {
  const legField = leg === "LEFT" ? "leftLeg" : "rightLeg";

  const result = await UserModel.aggregate([
    { $match: { memId: referrerMemId } },
    {
      $graphLookup: {
        from: "users",               // collection name in MongoDB (lowercase plural)
        startWith: `$${legField}`,   // "$leftLeg" or "$rightLeg"
        connectFromField: legField,  // leftLeg or rightLeg
        connectToField: "memId",     // connect memId chain
        as: "chain",
        depthField: "depth"
      }
    },
    {
      $addFields: {
        lastUser: {
          $cond: [
            { $gt: [{ $size: "$chain" }, 0] },
            { $arrayElemAt: [
                "$chain",
                { $subtract: [{ $size: "$chain" }, 1] }
              ]
            },
            "$$ROOT"
          ]
        }
      }
    },
    {
      $limit: 1
    }
  ]);

  if (!result.length) return null;

  return result[0].lastUser;
};
