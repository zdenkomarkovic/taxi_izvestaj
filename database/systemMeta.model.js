import { Schema, model, models } from "mongoose";

const SystemMetaSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const SystemMeta = models?.SystemMeta || model("SystemMeta", SystemMetaSchema);

export default SystemMeta;
