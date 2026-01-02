import { Schema, model, models } from "mongoose";

const ZamenaUljaSchema = new Schema(
  {
    kilometraza: { type: Number, required: true },
  },
  { timestamps: true }
);

const ZamenaUlja = models?.ZamenaUlja || model("ZamenaUlja", ZamenaUljaSchema);

export default ZamenaUlja;
