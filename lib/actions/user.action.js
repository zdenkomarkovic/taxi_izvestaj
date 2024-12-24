"use server";

import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";

export async function createUser(params) {
  try {
    connectToDatabase();
    const { name, password, path } = params;
    const newUser = await User.create({
      name,
      password,
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
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
