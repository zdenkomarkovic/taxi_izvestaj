import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUser } from "@/lib/actions/user.action";

export async function POST(request) {
  try {
    // Proveri autentifikaciju
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, password, role = "user" } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Ime i lozinka su obavezni" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Lozinka mora imati najmanje 6 karaktera" },
        { status: 400 }
      );
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Neispravna uloga" },
        { status: 400 }
      );
    }

    const result = await createUser({ name, password, role });

    return NextResponse.json(
      {
        success: true,
        message: "Korisnik uspešno kreiran",
        userId: result.userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.message.includes("već postoji")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Greška pri kreiranju korisnika" },
      { status: 500 }
    );
  }
}
