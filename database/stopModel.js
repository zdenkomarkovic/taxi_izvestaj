import { Schema, model, models } from "mongoose";

const StopSchema = new Schema(
  {
    kmSat: { type: Number, required: true },
    kmTax: { type: Number, required: true },
    kmGaz: { type: Number, required: true },
    iznos: { type: Number, required: true },
    plin: { type: Number, default: 0 },
    benzin: { type: Number, default: 0 },
    pranje: { type: Number, default: 0 },
    pogresanStart: { type: Number, default: 0 },
    kartica: [{ type: Number, default: 0 }],
    troskovi: [
      {
        iznosTroska: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    umanjenje: [
      {
        iznosUmanjenja: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Stop = models?.Stop || model("Stop", StopSchema);
export default Stop;
