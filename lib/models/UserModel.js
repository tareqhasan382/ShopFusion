import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    wishlist: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 14);
  next();
});

let UserModel;

try {
  UserModel = mongoose.model("User");
} catch {
  UserModel = mongoose.model("User", userSchema);
}

export default UserModel;
