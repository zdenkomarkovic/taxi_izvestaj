import { Schema, model, models } from "mongoose";

const StopSchema = new Schema(
  {
    kmSatRazlika: { type: Number, default: 0 },
    kmSatPocetna: { type: Number, default: 0 },
    kmSat: { type: Number, required: true },
    kmTaxRazlika: { type: Number, default: 0 },
    kmTaxPocetna: { type: Number, default: 0 },
    kmTax: { type: Number, required: true },
    kmGazRazlika: { type: Number, default: 0 },
    kmGazPocetna: { type: Number, default: 0 },
    kmGaz: { type: Number, required: true },
    iznosRazlika: { type: Number, default: 0 },
    iznosPocetna: { type: Number, default: 0 },
    iznos: { type: Number, required: true },
    gotovina: { type: Number, default: 0 },
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
