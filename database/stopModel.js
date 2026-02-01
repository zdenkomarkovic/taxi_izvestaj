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
    plin: {
      racun: { type: Number, default: 0 },
      kilometraza: { type: Number, default: 0 },
    },
    benzin: [{ type: Number, default: 0 }],
    kartica: [{ type: Number, default: 0 }],
    prekoRacuna: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    troskovi: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    umanjenje: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isChecked: { type: Boolean, default: false },
    // Polja koja prate da li su početne vrednosti ručno promenjene
    kmSatPocetnaChanged: { type: Boolean, default: false },
    kmTaxPocetnaChanged: { type: Boolean, default: false },
    kmGazPocetnaChanged: { type: Boolean, default: false },
    iznosPocetnaChanged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Stop = models?.Stop || model("Stop", StopSchema);
export default Stop;
