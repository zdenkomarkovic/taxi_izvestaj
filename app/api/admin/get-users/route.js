import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/database/user.model";

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    // Proveri da li je korisnik admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Samo admin može videti listu korisnika" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Greška pri učitavanju korisnika" },
      { status: 500 }
    );
  }
}
