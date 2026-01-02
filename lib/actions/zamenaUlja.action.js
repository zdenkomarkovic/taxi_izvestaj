"use server";

import ZamenaUlja from "@/database/zamenaUlja.model";
import { connectToDatabase } from "../mongoose";

// Dodaj zapis o zameni ulja
export async function addZamenaUlja(kilometraza) {
  try {
    await connectToDatabase();

    if (!kilometraza || isNaN(kilometraza)) {
      throw new Error("Kilometraža mora biti validan broj");
    }

    const novaZamena = await ZamenaUlja.create({
      kilometraza: Number(kilometraza),
    });

    console.log("Zamena ulja dodata:", novaZamena._id);

    return {
      success: true,
      zamena: JSON.parse(JSON.stringify(novaZamena)),
    };
  } catch (error) {
    console.error("Error adding zamena ulja:", error);
    throw new Error(error.message || "Greška pri dodavanju zamene ulja");
  }
}

// Dobij sve zapise o zameni ulja
export async function getZameneUlja() {
  try {
    await connectToDatabase();

    const zamene = await ZamenaUlja.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(zamene));
  } catch (error) {
    console.error("Error getting zamene ulja:", error);
    return [];
  }
}

// Obriši zapis o zameni ulja
export async function deleteZamenaUlja(zamenaId) {
  try {
    await connectToDatabase();

    const result = await ZamenaUlja.findByIdAndDelete(zamenaId);

    if (!result) {
      throw new Error("Zapis nije pronađen");
    }

    console.log("Zamena ulja obrisana:", zamenaId);

    return {
      success: true,
      message: "Zapis uspešno obrisan",
    };
  } catch (error) {
    console.error("Error deleting zamena ulja:", error);
    throw new Error(error.message || "Greška pri brisanju zamene ulja");
  }
}
