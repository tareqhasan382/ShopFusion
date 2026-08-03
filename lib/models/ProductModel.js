import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required."],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters."],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Brand cannot exceed 100 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters."],
    },
    media: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.length <= 10,
        message: "A product can have at most 10 images.",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters."],
    },
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    tags: [String],
    sizes: [String],
    colors: [String],
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative."],
    },
    expense: {
      type: Number,
      default: 0,
      min: [0, "Expense cannot be negative."],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative."],
    },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ brand: 1, isDeleted: 1 });

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ProductModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;
