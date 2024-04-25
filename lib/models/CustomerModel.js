import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    email: String,
    orders: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    },
  },
  { timestamps: true }
);

const CustomerModel =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default CustomerModel;
