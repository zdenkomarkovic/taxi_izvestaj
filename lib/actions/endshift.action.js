"use server";
import Stop from "@/database/stopModel";
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
    const endshifts = await Stop.find(filter).sort({ createdAt: -1 });

    const transformedEndShifts = endshifts.map((shift) => ({
      ...shift.toObject(),
      _id: shift._id.toString(),
      // Samo konvertuj userId u string ako postoji
      userId: shift.userId ? shift.userId.toString() : null,
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
    const lastEndshift = await Stop.findOne(filter).sort({ _id: -1 });

    if (lastEndshift) {
      const plainLastEndShift = lastEndshift.toObject();
      delete plainLastEndShift.__v;
      plainLastEndShift._id = plainLastEndShift._id.toString();
      // Samo konvertuj userId u string ako postoji
      plainLastEndShift.userId = plainLastEndShift.userId
        ? plainLastEndShift.userId.toString()
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
