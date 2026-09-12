import {
  findMatches
} from "../matching/matchingService.js";

export async function getMatches(
  req,
  res,
  next
) {
  try {
    const result =
      await findMatches(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: {
        sourceItem: {
          id:
            result.sourceItem.id,
          type:
            result.sourceItem.type,
          title:
            result.sourceItem.title
        },

        matches:
          result.matches
      }
    });
  } catch (error) {
    next(error);
  }
}