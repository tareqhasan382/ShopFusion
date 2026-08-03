import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required."],
      uppercase: true,
      trim: true,
      unique: true,
      maxlength: [50, "Coupon code cannot exceed 50 characters."],
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "Coupon type is required."],
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required."],
      min: [0, "Coupon value cannot be negative."],
    },
    minOrderAmount: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    maxDiscount: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    usedCount: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default CouponModel;
