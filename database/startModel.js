import { Schema, model, models } from "mongoose";

const StartSchema = new Schema(
  {
    kmSat: { type: Number, required: true },
    kmTax: { type: Number, required: true },
    kmGaz: { type: Number, required: true },
    iznos: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
const Start = models?.Start || model("Start", StartSchema);
export default Start;
