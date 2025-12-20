import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Sva polja su obavezna" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Nova lozinka mora imati najmanje 6 karaktera" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }

    // Proveri trenutnu lozinku
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Trenutna lozinka nije ispravna" },
        { status: 400 }
      );
    }

    // Hešuj novu lozinku
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Ažuriraj lozinku
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Lozinka uspešno promenjena" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Greška pri promeni lozinke" },
      { status: 500 }
    );
  }
}
