import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";

export async function PUT(request) {
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
        { error: "Samo admin može editovati korisnike" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, name, password, role } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID korisnika je obavezan" },
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

    // Ažuriraj ime ako je prosleđeno
    if (name && name !== user.name) {
      // Proveri da li novo ime već postoji
      const existingUser = await User.findOne({ name, _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Korisnik sa ovim imenom već postoji" },
          { status: 409 }
        );
      }
      user.name = name;
    }

    // Ažuriraj lozinku ako je prosleđena
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Lozinka mora imati najmanje 6 karaktera" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Ažuriraj ulogu ako je prosleđena
    if (role && ["admin", "user"].includes(role)) {
      // Proveri da ne menjamo poslednjeg admina u običnog korisnika
      if (user.role === "admin" && role === "user") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Ne možete promeniti ulogu poslednjeg admina" },
            { status: 400 }
          );
        }
      }
      user.role = role;
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Korisnik uspešno ažuriran",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error editing user:", error);
    return NextResponse.json(
      { error: "Greška pri ažuriranju korisnika" },
      { status: 500 }
    );
  }
}
