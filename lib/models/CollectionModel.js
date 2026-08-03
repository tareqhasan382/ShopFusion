import mongoose, { Schema } from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    image: {
      type: String,
      default: "",
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

collectionSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const CollectionModel =
  mongoose.models.Collection || mongoose.model("Collection", collectionSchema);

export default CollectionModel;
