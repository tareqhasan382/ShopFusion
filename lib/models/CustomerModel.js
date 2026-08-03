import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User is required."],
      index: true,
    },
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

customerSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const CustomerModel =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default CustomerModel;
