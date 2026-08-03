import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerUserId: {
      type: String,
      required: [true, "Customer is required."],
      index: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: String,
        size: String,
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1."],
        },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    shippingRate: String,
    stripeSessionId: {
      type: String,
      index: true,
      sparse: true,
    },
    paymentIntentId: {
      type: String,
      index: true,
      sparse: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative."],
    },
    subtotalAmount: {
      type: Number,
      default: 0,
      min: [0, "Subtotal cannot be negative."],
    },
    shippingAmount: {
      type: Number,
      default: 0,
      min: [0, "Shipping cannot be negative."],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative."],
    },
    couponCode: { type: String, default: "", trim: true, uppercase: true },
    couponCounted: { type: Boolean, default: false },
    invoiceNumber: { type: String, default: "", trim: true },
    trackingNumber: { type: String, default: "", trim: true },
    carrier: { type: String, default: "", trim: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
