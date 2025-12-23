"use server";
import Stop from "@/database/stopModel";
import SystemMeta from "@/database/systemMeta.model";
import { connectToDatabase } from "../mongoose";

export async function CreateEndshift({ ...params }) {
  try {
    await connectToDatabase();

    const newEndshift = await Stop.create({ ...params });

    console.log("Novi zapis uspešno kreiran:", newEndshift);
  } catch (error) {
    console.log("Greska pri kreiranju", error);
    throw new Error("Kreiranje nije uspelo.");
  }
}
export async function GetEndShifts(userId) {
  try {
    await connectToDatabase();

    // Ako je userId prosleđen, filtriraj po njemu
    const filter = userId ? { userId } : {};
    const endshifts = await Stop.find(filter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const transformedEndShifts = endshifts.map((shift) => ({
      ...shift.toObject(),
      _id: shift._id.toString(),
      // Dodaj user podatke
      user: shift.userId ? {
        id: shift.userId._id.toString(),
        name: shift.userId.name,
      } : null,
      // Konvertuj userId u string
      userId: shift.userId ? shift.userId._id.toString() : null,
    }));
    return transformedEndShifts;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch endshifts");
  }
}

export async function GetLastEndShift(userId) {
  try {
    await connectToDatabase();

    // Ako je userId prosleđen, filtriraj po njemu
    const filter = userId ? { userId } : {};
    const lastEndshift = await Stop.findOne(filter)
      .populate('userId', 'name')
      .sort({ _id: -1 });

    if (lastEndshift) {
      const plainLastEndShift = lastEndshift.toObject();
      delete plainLastEndShift.__v;
      plainLastEndShift._id = plainLastEndShift._id.toString();
      // Dodaj user podatke
      plainLastEndShift.user = plainLastEndShift.userId ? {
        id: plainLastEndShift.userId._id.toString(),
        name: plainLastEndShift.userId.name,
      } : null;
      // Konvertuj userId u string
      plainLastEndShift.userId = plainLastEndShift.userId
        ? plainLastEndShift.userId._id.toString()
        : null;
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

export async function DeleteEndShift(recordId) {
  try {
    await connectToDatabase();

    // Prvo pronađi poslednji zapis
    const lastRecord = await Stop.findOne().sort({ _id: -1 });

    if (!lastRecord) {
      throw new Error("Nema zapisa za brisanje");
    }

    // Proveri da li je recordId koji pokušavamo obrisati zaista poslednji
    if (lastRecord._id.toString() !== recordId) {
      throw new Error("Može se obrisati samo poslednji zapis. Molimo osvežite stranicu.");
    }

    // KLJUČNA ZAŠTITA: Proveri da li postoji zapis o poslednjem obrisanom ID-ju
    const lastDeletedIdMeta = await SystemMeta.findOne({ key: "lastDeletedRecordId" });

    if (lastDeletedIdMeta && lastDeletedIdMeta.value) {
      // Proveri da li je trenutni zapis stariji ili jednak poslednjeg obrisanog
      // MongoDB ObjectId sadrži timestamp, pa možemo da ih poredimo
      if (recordId <= lastDeletedIdMeta.value) {
        throw new Error("Ne možete obrisati unos koji je stariji ili jednak poslednjeg obrisanog unosa.");
      }
    }

    // KRITIČNA SEKCIJA: Obriši SAMO ako je ID i dalje poslednji
    const result = await Stop.findOneAndDelete({
      _id: recordId,
    });

    if (!result) {
      throw new Error("Zapis nije mogao biti obrisan. Molimo osvežite stranicu.");
    }

    // VAŽNO: Sačuvaj ID obrisanog zapisa
    await SystemMeta.findOneAndUpdate(
      { key: "lastDeletedRecordId" },
      {
        key: "lastDeletedRecordId",
        value: recordId,
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log("Zapis obrisan:", result._id);

    return { success: true, message: "Zapis uspešno obrisan" };
  } catch (error) {
    console.log("Error deleting endshift:", error);
    throw error;
  }
}

// Funkcija za dobijanje ID-ja poslednjeg obrisanog zapisa
export async function GetLastDeletedRecordId() {
  try {
    await connectToDatabase();

    const lastDeletedIdMeta = await SystemMeta.findOne({ key: "lastDeletedRecordId" });

    return {
      lastDeletedId: lastDeletedIdMeta ? lastDeletedIdMeta.value : null,
    };
  } catch (error) {
    console.log("Error getting last deleted ID:", error);
    return { lastDeletedId: null };
  }
}

// Nova funkcija za brisanje bilo kog zapisa (samo za admina)
export async function DeleteAnyEndShift(recordId) {
  try {
    await connectToDatabase();

    const result = await Stop.findByIdAndDelete(recordId);

    if (!result) {
      throw new Error("Zapis nije pronađen");
    }

    console.log("Zapis obrisan:", result._id);

    return { success: true, message: "Zapis uspešno obrisan" };
  } catch (error) {
    console.log("Error deleting endshift:", error);
    throw error;
  }
}

// Nova funkcija za ažuriranje zapisa (samo za admina)
export async function UpdateEndShift(recordId, updateData) {
  try {
    await connectToDatabase();

    const result = await Stop.findByIdAndUpdate(
      recordId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!result) {
      throw new Error("Zapis nije pronađen");
    }

    console.log("Zapis ažuriran:", result._id);

    return { success: true, message: "Zapis uspešno ažuriran", data: result };
  } catch (error) {
    console.log("Error updating endshift:", error);
    throw error;
  }
}
