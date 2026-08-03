import mongoose from "mongoose";

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "ShopFusion", trim: true },
    tagline: { type: String, default: "", trim: true },
    supportEmail: { type: String, default: "", trim: true },
    supportPhone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    currency: { type: String, default: "usd", trim: true },
    lowStockThreshold: { type: Number, default: 5, min: [0, "Cannot be negative."] },
    freeShippingThreshold: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    shippingCharge: { type: Number, default: 0, min: [0, "Cannot be negative."] },
    seoTitle: { type: String, default: "ShopFusion", trim: true },
    seoDescription: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

/** Ensure exactly one settings document exists. */
export const getStoreSettings = async () => {
  const settings = await StoreSettingModel.findOne();
  if (settings) return settings;
  return StoreSettingModel.create({});
};

storeSettingSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const StoreSettingModel =
  mongoose.models.StoreSetting ||
  mongoose.model("StoreSetting", storeSettingSchema);

export default StoreSettingModel;
