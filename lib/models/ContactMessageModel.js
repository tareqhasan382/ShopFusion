import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters."],
    },
    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters."],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactMessageSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ContactMessageModel =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessageModel;
