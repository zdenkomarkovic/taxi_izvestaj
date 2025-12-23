import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import Stop from "@/database/stopModel";

export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "ID zapisa je obavezan" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Pronađi zapis koji se briše
    const recordToDelete = await Stop.findById(recordId);

    if (!recordToDelete) {
      return NextResponse.json(
        { error: "Zapis nije pronađen" },
        { status: 404 }
      );
    }

    // Pronađi poslednji zapis u celom sistemu
    const lastRecord = await Stop.findOne().sort({ _id: -1 });

    // Proveri da li je zapis koji se briše zaista poslednji
    if (!lastRecord || lastRecord._id.toString() !== recordId) {
      return NextResponse.json(
        { error: "Može se obrisati samo poslednji zapis" },
        { status: 403 }
      );
    }

    // Obriši zapis
    await Stop.findByIdAndDelete(recordId);

    return NextResponse.json(
      { success: true, message: "Zapis uspešno obrisan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json(
      { error: "Greška pri brisanju zapisa" },
      { status: 500 }
    );
  }
}
