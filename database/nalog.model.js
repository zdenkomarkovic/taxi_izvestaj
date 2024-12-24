const { Schema, models, model } = require("mongoose");

const NalogSchema = new Schema(
  {
    kmSat: { type: String, required: true },
    password: { type: Number, required: true },
  },
  { timestamps: true }
);

const Nalog = models?.Nalog || model("Nalog", NalogSchema);
export default Nalog;
