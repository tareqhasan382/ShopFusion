import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required."],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    name: { type: String, trim: true, maxlength: [50, "Name too long."] },
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters."],
    },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ReviewModel =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default ReviewModel;
