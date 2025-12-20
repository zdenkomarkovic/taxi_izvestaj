"use server";

import Start from "@/database/startModel";
import { connectToDatabase } from "../mongoose";

export async function CreateStart(params) {
  try {
    await connectToDatabase();
    const { kmSat, kmTax, kmGaz, iznos, userId } = params;
    const newStart = await Start.create({
      kmSat,
      kmTax,
      kmGaz,
      iznos,
      userId,
    });
  } catch (error) {
    console.log(error);
  }
}
export async function GetStarts(userId) {
  try {
    await connectToDatabase();

    // Ako je userId prosleđen, filtriraj po njemu
    const filter = userId ? { userId } : {};
    const starts = await Start.find(filter);
    return starts;
  } catch (error) {
    console.log(error);
  }
}

export async function GetLastStart(userId) {
  try {
    await connectToDatabase();

    // Ako je userId prosleđen, filtriraj po njemu
    const filter = userId ? { userId } : {};
    const start = await Start.findOne(filter).sort({ _id: -1 });

    if (start) {
      const plainStart = start.toObject();
      delete plainStart.__v;

      plainStart._id = plainStart._id.toString();
      // Samo konvertuj userId u string ako postoji
      plainStart.userId = plainStart.userId
        ? plainStart.userId.toString()
        : null;
      return plainStart;
    } else {
      console.log("Nothing found");
      return null;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch the last item.");
  }
}
