import mongoose, { Schema } from "mongoose";
const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const CollectionModel =
  mongoose.models.Collection || mongoose.model("Collection", collectionSchema);
export default CollectionModel;
