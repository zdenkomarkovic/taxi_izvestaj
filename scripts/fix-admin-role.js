const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function fixAdminRole() {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL nije definisan u .env.local");
      process.exit(1);
    }

    console.log("🔌 Povezivanje sa MongoDB bazom...");
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "taxi_izvestaj",
    });
    console.log("✅ Povezan sa MongoDB bazom\n");

    // Pronađi admin korisnika
    console.log("👤 Tražim korisnika 'admin'...");
    const adminUser = await User.findOne({ name: "admin" });

    if (!adminUser) {
      console.log("❌ Admin korisnik ne postoji!");
      console.log("\n💡 Pokreni prvo: npm run create-admin");
      process.exit(1);
    }

    console.log(`✅ Pronađen korisnik: ${adminUser.name}`);
    console.log(`   Trenutna uloga: ${adminUser.role || "NEMA ROLE!"}`);

    if (adminUser.role === "admin") {
      console.log("\n✅ Admin već ima admin ulogu. Sve je u redu!");
      process.exit(0);
    }

    // Ažuriraj role na admin
    console.log("\n🔧 Ažuriram ulogu na 'admin'...");
    adminUser.role = "admin";
    await adminUser.save();

    console.log("✅ Uloga uspešno ažurirana!");
    console.log(`   Nova uloga: ${adminUser.role}`);

    // Proveri sve korisnike
    console.log("\n" + "=".repeat(50));
    console.log("📊 SVI KORISNICI U SISTEMU:");
    console.log("=".repeat(50));

    const allUsers = await User.find();
    allUsers.forEach((user) => {
      const roleDisplay = user.role || "nema role";
      const roleEmoji = user.role === "admin" ? "👑" : "👤";
      console.log(`${roleEmoji} ${user.name} - ${roleDisplay}`);
    });

    console.log("\n✅ Sada se možeš prijaviti kao admin i pristupiti /admin stranici!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("\n⚠️  Ne zaboravi da promeniš lozinku nakon prijave!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Greška:", error);
    process.exit(1);
  }
}

fixAdminRole();
