import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subscribed: { type: Boolean, default: true },
    unsubscribedAt: { type: Date, default: null },
    source: {
      type: String,
      default: "footer",
      enum: ["footer", "admin"],
    },
  },
  { timestamps: true }
);

subscriberSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const SubscriberModel =
  mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);

export default SubscriberModel;
