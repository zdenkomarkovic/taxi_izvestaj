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
    await connectToDatabase();
    const users = await User.find().lean();
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function updateUserMultiplier(params) {
  try {
    console.log("updateUserMultiplier called with params:", params);

    await connectToDatabase();
    const { userId, multiplier } = params;

    console.log("Updating multiplier in DB:", { userId, multiplier });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { multiplier: Number(multiplier) } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Korisnik nije pronađen");
    }

    console.log("Updated user from DB:", {
      id: updatedUser._id,
      name: updatedUser.name,
      multiplier: updatedUser.multiplier
    });

    return {
      success: true,
      user: JSON.parse(JSON.stringify(updatedUser))
    };
  } catch (error) {
    console.error("Error updating multiplier:", error);
    throw new Error(error.message || "Greška pri ažuriranju množioca");
  }
}

// Dodaj napomenu korisniku
export async function addUserNapomena(params) {
  try {
    await connectToDatabase();
    const { userId, tekst } = params;

    if (!tekst || tekst.trim() === "") {
      throw new Error("Napomena ne može biti prazna");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          napomene: {
            tekst: tekst.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Korisnik nije pronađen");
    }

    console.log("Napomena dodata za korisnika:", updatedUser.name);

    return {
      success: true,
      user: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    console.error("Error adding napomena:", error);
    throw new Error(error.message || "Greška pri dodavanju napomene");
  }
}

// Obriši napomenu korisnika
export async function deleteUserNapomena(params) {
  try {
    await connectToDatabase();
    const { userId, napomenaId } = params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          napomene: { _id: napomenaId },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Korisnik nije pronađen");
    }

    console.log("Napomena obrisana za korisnika:", updatedUser.name);

    return {
      success: true,
      user: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    console.error("Error deleting napomena:", error);
    throw new Error(error.message || "Greška pri brisanju napomene");
  }
}
