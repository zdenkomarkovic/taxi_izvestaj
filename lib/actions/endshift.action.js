"use server";

import Stop from "@/database/stopModel";
import { connectToDatabase } from "../mongoose";

export async function CreateEndshift(params) {
  try {
    connectToDatabase();
    const {
      kmSatRazlika,
      kmSatPocetna,
      kmSat,
      kmTaxRazlika,
      kmTaxPocetna,
      kmTax,
      kmGazRazlika,
      kmGazPocetna,
      kmGaz,
      iznos,
      iznosRazlika,
      iznosPocetna,
      gotovina,
      plin,
      benzin,
      pranje,
      pogresanStart,
      kartica,
      troskovi,
      umanjenje,
    } = params;
    const newEndshift = await Stop.create({
      kmSatRazlika,
      kmSatPocetna,
      kmSat,
      kmTaxRazlika,
      kmTaxPocetna,
      kmTax,
      kmGazRazlika,
      kmGazPocetna,
      kmGaz,
      iznos,
      iznosRazlika,
      iznosPocetna,
      gotovina,
      plin,
      benzin,
      pranje,
      pogresanStart,
      kartica,
      troskovi,
      umanjenje,
    });

    console.log("Novi zapis uspešno kreiran:", newEndshift);
  } catch (error) {
    console.log(error);
  }
}
export async function GetEndShifts() {
  try {
    connectToDatabase();
    const endshifts = await Stop.find().sort({ createdAt: -1 });
    return endshifts;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch endshifts");
  }
}

export async function GetLastEndShift() {
  try {
    connectToDatabase();
    const lastEndshift = await Stop.findOne().sort({ _id: -1 });
    if (lastEndshift) {
      const plainLastEndShift = lastEndshift.toObject();
      delete plainLastEndShift.__v;
      plainLastEndShift._id = plainLastEndShift._id.toString();
      return plainLastEndShift;
    } else {
      console.log("Nothing found");
      return null;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch endshifts");
  }
}
