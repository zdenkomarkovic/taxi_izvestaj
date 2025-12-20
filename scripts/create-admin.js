const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("MONGODB_URL nije definisan u .env.local");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "taxi_izvestaj",
    });

    console.log("Povezan sa MongoDB bazom");

    // Proveri da li admin već postoji
    const existingAdmin = await User.findOne({ name: "admin" });

    if (existingAdmin) {
      console.log("Admin korisnik već postoji!");
      process.exit(0);
    }

    // Kreiraj hash lozinke
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Kreiraj admin korisnika
    const admin = await User.create({
      name: "admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin korisnik uspešno kreiran!");
    console.log("Korisničko ime: admin");
    console.log("Lozinka: admin123");
    console.log("\n⚠️  VAŽNO: Promenite ovu lozinku nakon prve prijave!");

    process.exit(0);
  } catch (error) {
    console.error("Greška:", error);
    process.exit(1);
  }
}

createAdmin();
