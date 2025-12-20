"use server";

import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import bcrypt from "bcryptjs";

export async function createUser(params) {
  try {
    await connectToDatabase();
    const { name, password, role = "user", path } = params;

    // Proveri da li korisnik već postoji
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      throw new Error("Korisnik sa ovim imenom već postoji");
    }

    // Heširanje lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      password: hashedPassword,
      role,
    });

    if (path) {
      revalidatePath(path);
    }

    return { success: true, userId: newUser._id };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getUsers() {
  try {
    connectToDatabase();
    const users = await User.find();
    return users;
  } catch (error) {
    console.log(error);
  }
}
