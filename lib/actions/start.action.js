"use server";

import Start from "@/database/startModel";
import { connectToDatabase } from "../mongoose";

export async function CreateStart(params) {
  try {
    connectToDatabase();
    const { kmSat, kmTax, kmGaz, iznos } = params;
    const newStart = await Start.create({
      kmSat,
      kmTax,
      kmGaz,
      iznos,
    });
  } catch (error) {
    console.log(error);
  }
}
export async function GetStarts() {
  try {
    connectToDatabase();

    const starts = await Start.find();
    return starts;
  } catch (error) {
    console.log(error);
  }
}

export async function GetLastStart() {
  try {
    connectToDatabase();
    const start = await Start.findOne().sort({ _id: -1 });
    if (start) {
      const plainStart = start.toObject();
      delete plainStart.__v;

      plainStart._id = plainStart._id.toString();
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
