import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [50, "Name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      maxlength: [72, "Password cannot exceed 72 characters."],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    phone: { type: String, default: "", trim: true, maxlength: [30, "Phone too long."] },
    avatar: { type: String, default: "" },
    addresses: {
      type: [
        {
          label: { type: String, default: "" },
          name: { type: String, default: "" },
          phone: { type: String, default: "" },
          street: { type: String, default: "" },
          city: { type: String, default: "" },
          state: { type: String, default: "" },
          postalCode: { type: String, default: "" },
          country: { type: String, default: "" },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Only hash the password when it actually changes. Fixes the bug where
// saving the user (e.g. wishlist updates) re-hashed an already-hashed password.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next(new Error("Password is required."));
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    ret.id = ret._id.toString();
    return ret;
  },
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
