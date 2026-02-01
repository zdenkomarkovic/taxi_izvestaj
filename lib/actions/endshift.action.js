"use server";
import Stop from "@/database/stopModel";
import SystemMeta from "@/database/systemMeta.model";
import { connectToDatabase } from "../mongoose";
import mongoose from "mongoose";

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
export async function GetEndShifts(userId, page = 1, limit = null, dateFilter = null) {
  try {
    await connectToDatabase();

    // Ako je userId prosleđen, filtriraj po njemu
    const filter = userId ? { userId } : {};

    // Dodaj datum filter ako je prosleđen (za obične korisnike - trenutni i prošli mesec)
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      filter.createdAt = {
        $gte: dateFilter.startDate,
        $lt: dateFilter.endDate
      };
    }

    // Ako limit nije prosleđen, vrati sve (za kompatibilnost sa starim kodom)
    let query = Stop.find(filter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Primeni paginaciju samo ako je limit prosleđen
    if (limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const endshifts = await query;

    const transformedEndShifts = endshifts.map((shift) => {
      const shiftObj = shift.toObject();
      return {
        _id: shift._id.toString(),
        kmSatRazlika: shiftObj.kmSatRazlika,
        kmSatPocetna: shiftObj.kmSatPocetna,
        kmSat: shiftObj.kmSat,
        kmTaxRazlika: shiftObj.kmTaxRazlika,
        kmTaxPocetna: shiftObj.kmTaxPocetna,
        kmTax: shiftObj.kmTax,
        kmGazRazlika: shiftObj.kmGazRazlika,
        kmGazPocetna: shiftObj.kmGazPocetna,
        kmGaz: shiftObj.kmGaz,
        iznosRazlika: shiftObj.iznosRazlika,
        iznosPocetna: shiftObj.iznosPocetna,
        iznos: shiftObj.iznos,
        gotovina: shiftObj.gotovina,
        plin: shiftObj.plin,
        benzin: shiftObj.benzin,
        kartica: shiftObj.kartica,
        prekoRacuna: shiftObj.prekoRacuna,
        troskovi: shiftObj.troskovi,
        umanjenje: shiftObj.umanjenje,
        isChecked: shiftObj.isChecked || false,
        kmSatPocetnaChanged: shiftObj.kmSatPocetnaChanged || false,
        kmTaxPocetnaChanged: shiftObj.kmTaxPocetnaChanged || false,
        kmGazPocetnaChanged: shiftObj.kmGazPocetnaChanged || false,
        iznosPocetnaChanged: shiftObj.iznosPocetnaChanged || false,
        createdAt: shiftObj.createdAt,
        updatedAt: shiftObj.updatedAt,
        // Dodaj user podatke
        user: shift.userId ? {
          id: shift.userId._id.toString(),
          name: shift.userId.name,
        } : null,
        // Konvertuj userId u string
        userId: shift.userId ? shift.userId._id.toString() : null,
      };
    });
    // Serializuj i deserializuj da osiguraš čist objekat bez Mongoose metapodataka
    return JSON.parse(JSON.stringify(transformedEndShifts));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch endshifts");
  }
}

// Nova funkcija za dobijanje ukupnog broja zapisa
export async function GetEndShiftsCount(userId, dateFilter = null) {
  try {
    await connectToDatabase();

    const filter = userId ? { userId } : {};

    // Dodaj datum filter ako je prosleđen (za obične korisnike - trenutni i prošli mesec)
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      filter.createdAt = {
        $gte: dateFilter.startDate,
        $lt: dateFilter.endDate
      };
    }

    const count = await Stop.countDocuments(filter);

    return count;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to count endshifts");
  }
}

// Nova funkcija za dobijanje samo ID-ja poslednjeg zapisa
export async function GetLastEndShiftId() {
  try {
    await connectToDatabase();

    const lastShift = await Stop.findOne()
      .sort({ _id: -1 })
      .select('_id');

    return lastShift ? lastShift._id.toString() : null;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch last endshift ID");
  }
}

// Nova funkcija za dobijanje dostupnih meseci
export async function GetAvailableMonths(userId, isAdmin = false) {
  try {
    await connectToDatabase();

    // Konvertuj userId string u ObjectId za agregaciju
    const filter = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};

    // Za obične korisnike, dodaj filter za trenutni i prošli mesec
    if (!isAdmin && userId) {
      const now = new Date();
      const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      filter.createdAt = {
        $gte: firstDayOfPreviousMonth,
        $lt: firstDayOfNextMonth
      };
    }

    // Koristi agregaciju da dobije unique mesece
    const months = await Stop.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          firstDate: { $min: "$createdAt" }
        }
      },
      { $sort: { "firstDate": -1 } }
    ]);

    // Formatiraj mesece u "mesec godina" format
    const formattedMonths = months.map(m => {
      const date = new Date(m.firstDate);
      return {
        key: `${m._id.year}-${m._id.month}`,
        label: date.toLocaleDateString("sr-RS", {
          month: "long",
          year: "numeric",
          timeZone: "Europe/Belgrade",
        }),
        year: m._id.year,
        month: m._id.month
      };
    });

    return JSON.parse(JSON.stringify(formattedMonths));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch available months");
  }
}

// Nova funkcija za dobijanje zapisa za određeni mesec
export async function GetEndShiftsByMonth(userId, year, month, isAdmin = false) {
  try {
    await connectToDatabase();

    const filter = userId ? { userId } : {};

    // Za obične korisnike, proveri da li mesec pripada trenutnom ili prošlom mesecu
    if (!isAdmin && userId) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JS meseci su 0-11
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Dozvoli samo trenutni i prošli mesec
      const isCurrentMonth = year === currentYear && month === currentMonth;
      const isPreviousMonth = year === previousYear && month === previousMonth;

      if (!isCurrentMonth && !isPreviousMonth) {
        throw new Error("Nemate pristup ovom mesecu");
      }
    }

    // Dodaj filter za mesec i godinu
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    filter.createdAt = {
      $gte: startDate,
      $lt: endDate
    };

    const endshifts = await Stop.find(filter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const transformedEndShifts = endshifts.map((shift) => {
      const shiftObj = shift.toObject();
      return {
        _id: shift._id.toString(),
        kmSatRazlika: shiftObj.kmSatRazlika,
        kmSatPocetna: shiftObj.kmSatPocetna,
        kmSat: shiftObj.kmSat,
        kmTaxRazlika: shiftObj.kmTaxRazlika,
        kmTaxPocetna: shiftObj.kmTaxPocetna,
        kmTax: shiftObj.kmTax,
        kmGazRazlika: shiftObj.kmGazRazlika,
        kmGazPocetna: shiftObj.kmGazPocetna,
        kmGaz: shiftObj.kmGaz,
        iznosRazlika: shiftObj.iznosRazlika,
        iznosPocetna: shiftObj.iznosPocetna,
        iznos: shiftObj.iznos,
        gotovina: shiftObj.gotovina,
        plin: shiftObj.plin,
        benzin: shiftObj.benzin,
        kartica: shiftObj.kartica,
        prekoRacuna: shiftObj.prekoRacuna,
        troskovi: shiftObj.troskovi,
        umanjenje: shiftObj.umanjenje,
        isChecked: shiftObj.isChecked || false,
        kmSatPocetnaChanged: shiftObj.kmSatPocetnaChanged || false,
        kmTaxPocetnaChanged: shiftObj.kmTaxPocetnaChanged || false,
        kmGazPocetnaChanged: shiftObj.kmGazPocetnaChanged || false,
        iznosPocetnaChanged: shiftObj.iznosPocetnaChanged || false,
        createdAt: shiftObj.createdAt,
        updatedAt: shiftObj.updatedAt,
        user: shift.userId ? {
          id: shift.userId._id.toString(),
          name: shift.userId.name,
        } : null,
        userId: shift.userId ? shift.userId._id.toString() : null,
      };
    });

    return JSON.parse(JSON.stringify(transformedEndShifts));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch endshifts by month");
  }
}

// Funkcija za dobijanje prethodnog sipanja plina (za izračunavanje pređene km)
export async function GetPreviousGasFill(currentShiftDate, currentKm) {
  try {
    await connectToDatabase();

    // Pronađi prethodni shift sa sipanjem plina (pre trenutnog datuma)
    const previousShift = await Stop.findOne({
      createdAt: { $lt: new Date(currentShiftDate) },
      'plin.kilometraza': { $gt: 0 }
    })
      .sort({ createdAt: -1 })
      .select('plin.kilometraza');

    if (previousShift && previousShift.plin && previousShift.plin.kilometraza) {
      return currentKm - previousShift.plin.kilometraza;
    }

    return 0;
  } catch (error) {
    console.log(error);
    return 0;
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
      const shiftObj = lastEndshift.toObject();
      const plainLastEndShift = {
        _id: lastEndshift._id.toString(),
        kmSatRazlika: shiftObj.kmSatRazlika,
        kmSatPocetna: shiftObj.kmSatPocetna,
        kmSat: shiftObj.kmSat,
        kmTaxRazlika: shiftObj.kmTaxRazlika,
        kmTaxPocetna: shiftObj.kmTaxPocetna,
        kmTax: shiftObj.kmTax,
        kmGazRazlika: shiftObj.kmGazRazlika,
        kmGazPocetna: shiftObj.kmGazPocetna,
        kmGaz: shiftObj.kmGaz,
        iznosRazlika: shiftObj.iznosRazlika,
        iznosPocetna: shiftObj.iznosPocetna,
        iznos: shiftObj.iznos,
        gotovina: shiftObj.gotovina,
        plin: shiftObj.plin,
        benzin: shiftObj.benzin,
        kartica: shiftObj.kartica,
        prekoRacuna: shiftObj.prekoRacuna,
        troskovi: shiftObj.troskovi,
        umanjenje: shiftObj.umanjenje,
        isChecked: shiftObj.isChecked || false,
        kmSatPocetnaChanged: shiftObj.kmSatPocetnaChanged || false,
        kmTaxPocetnaChanged: shiftObj.kmTaxPocetnaChanged || false,
        kmGazPocetnaChanged: shiftObj.kmGazPocetnaChanged || false,
        iznosPocetnaChanged: shiftObj.iznosPocetnaChanged || false,
        createdAt: shiftObj.createdAt,
        updatedAt: shiftObj.updatedAt,
        user: lastEndshift.userId ? {
          id: lastEndshift.userId._id.toString(),
          name: lastEndshift.userId.name,
        } : null,
        userId: lastEndshift.userId ? lastEndshift.userId._id.toString() : null,
      };
      return JSON.parse(JSON.stringify(plainLastEndShift));
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

    // Ako je prosleđen createdAt kao string, konvertuj ga u Date
    if (updateData.createdAt) {
      updateData.createdAt = new Date(updateData.createdAt);
    }

    // Koristi MongoDB direktno da zaobiđeš Mongoose timestamp zaštitu
    const { ObjectId } = require('mongodb');
    const result = await Stop.collection.updateOne(
      { _id: new ObjectId(recordId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error("Zapis nije pronađen");
    }

    console.log("Zapis ažuriran:", recordId, "Modifikovano redova:", result.modifiedCount);

    // Vraćaj samo success message bez Mongoose dokumenta
    return { success: true, message: "Zapis uspešno ažuriran" };
  } catch (error) {
    console.log("Error updating endshift:", error);
    throw error;
  }
}

// Funkcija za čekiranje/rasčekiranje kartice (samo za admina)
export async function ToggleCheckEndShift(recordId, isChecked) {
  try {
    await connectToDatabase();

    const result = await Stop.findByIdAndUpdate(
      recordId,
      { $set: { isChecked } },
      { new: true }
    );

    if (!result) {
      throw new Error("Zapis nije pronađen");
    }

    console.log("Kartica čekirana:", result._id, "Status:", isChecked);

    return { success: true, message: "Status kartice uspešno ažuriran" };
  } catch (error) {
    console.log("Error toggling check status:", error);
    throw error;
  }
}
