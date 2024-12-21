import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: Number, required: true },
});
const User = models?.user || model("User", UserSchema);

export default User;
