import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/database/user.model";

export async function DELETE(request) {
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
        { error: "Samo admin može brisati korisnike" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID korisnika je obavezan" },
        { status: 400 }
      );
    }

    // Sprečiti admina da obriše sam sebe
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Ne možete obrisati sami sebe" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }

    // Sprečiti brisanje poslednjeg admina
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Ne možete obrisati poslednjeg admina" },
          { status: 400 }
        );
      }
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Korisnik uspešno obrisan",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Greška pri brisanju korisnika" },
      { status: 500 }
    );
  }
}
