"use server";

import Stop from "@/database/stopModel";
import { connectToDatabase } from "../mongoose";

export async function CreateEndshift(params) {
  try {
    connectToDatabase();
    const {
      kmSat,
      kmTax,
      kmGaz,
      iznos,
      plin,
      benzin,
      pranje,
      pogresanStart,
      kartica,
      troskovi,
      umanjenje,
    } = params;
    const newEndshift = await Stop.create({
      kmSat,
      kmTax,
      kmGaz,
      iznos,
      plin,
      benzin,
      pranje,
      pogresanStart,
      kartica,
      troskovi,
      umanjenje,
    });
  } catch (error) {
    console.log(error);
  }
}
