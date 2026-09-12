import {
  createItemSchema,
  updateItemSchema
} from "../validators/itemValidators.js";

import {
  itemQuerySchema
} from "../validators/queryValidators.js";

import {
  createNewItem,
  deleteOwnItem,
  getItem,
  getItems,
  updateOwnItem
} from "../services/itemService.js";

function validationMessage(error) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length
        ? `${issue.path.join(".")}: `
        : "";

      return `${path}${issue.message}`;
    })
    .join(", ");
}

export async function create(req, res, next) {
  try {
    const parsed = createItemSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error)
      });
    }

    const item = await createNewItem(
      req.user.id,
      parsed.data
    );

    return res.status(201).json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const parsed = itemQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error)
      });
    }

    const result = await getItems(parsed.data);

    const totalPages =
      result.total === 0
        ? 0
        : Math.ceil(
            result.total / parsed.data.limit
          );

    return res.status(200).json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          page: parsed.data.page,
          limit: parsed.data.limit,
          total: result.total,
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await getItem(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = updateItemSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error)
      });
    }

    const item = await updateOwnItem(
      req.params.id,
      req.user.id,
      parsed.data
    );

    return res.status(200).json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await deleteOwnItem(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}