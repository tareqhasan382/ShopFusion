import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import CollectionModel from "../../../../../lib/models/CollectionModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { isDescription, isObjectId, isTitle } from "../../../../../lib/validation";

export async function GET(req, { params }) {
  const { collectionId } = params;
  if (!isObjectId(collectionId)) return jsonError("Invalid collection id.", 400);

  try {
    await connectMongodb();
    const result = await CollectionModel.findById(collectionId).populate("products");
    if (!result) return jsonError("Collection not found.", 404);
    return jsonSuccess({ data: result });
  } catch (error) {
    console.error("[collection_GET]", error);
    return jsonError("Failed to load collection.");
  }
}

export async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { collectionId } = params;
  if (!isObjectId(collectionId)) return jsonError("Invalid collection id.", 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { title, description, image } = body || {};

  const errors = {};
  if (title !== undefined && !isTitle(title)) errors.title = "Title must be between 2 and 200 characters.";
  if (description !== undefined && !isDescription(description)) errors.description = "Description is too long.";

  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();
    const result = await CollectionModel.findByIdAndUpdate(
      collectionId,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(image !== undefined && { image }),
      },
      { new: true }
    );

    if (!result) return jsonError("Collection not found.", 404);
    return jsonSuccess({ data: result }, "Collection updated successfully.");
  } catch (error) {
    console.error("[collection_PATCH]", error);
    return jsonError("Failed to update collection.");
  }
}

export async function DELETE(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { collectionId } = params;
  if (!isObjectId(collectionId)) return jsonError("Invalid collection id.", 400);

  try {
    await connectMongodb();

    const collection = await CollectionModel.findById(collectionId);
    if (!collection) return jsonError("Collection not found.", 404);

    await CollectionModel.findByIdAndDelete(collectionId);

    // Remove the collection reference from its products.
    await ProductModel.updateMany(
      { collections: collectionId },
      { $pull: { collections: collectionId } }
    );

    return jsonSuccess({ data: collection }, "Collection deleted successfully.");
  } catch (error) {
    console.error("[collection_DELETE]", error);
    return jsonError("Failed to delete collection.");
  }
}
