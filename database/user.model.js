import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    multiplier: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const User = models?.User || model("User", UserSchema);

export default User;
