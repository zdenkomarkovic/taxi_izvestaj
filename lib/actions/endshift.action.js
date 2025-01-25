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
export async function GetEndShifts() {
  try {
    connectToDatabase();
    const endshifts = await Stop.find().sort({ createdAt: -1 });
    const transformedEndShifts = endshifts.map((shift) => ({
      ...shift.toObject(),
      _id: shift._id.toString(),
    }));
    return transformedEndShifts;
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
