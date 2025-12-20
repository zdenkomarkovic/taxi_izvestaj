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

const StartSchema = new mongoose.Schema(
  {
    kmSat: { type: Number, required: true },
    kmTax: { type: Number, required: true },
    kmGaz: { type: Number, required: true },
    iznos: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const StopSchema = new mongoose.Schema(
  {
    kmSatRazlika: { type: Number, default: 0 },
    kmSatPocetna: { type: Number, default: 0 },
    kmSat: { type: Number, required: true },
    kmTaxRazlika: { type: Number, default: 0 },
    kmTaxPocetna: { type: Number, default: 0 },
    kmTax: { type: Number, required: true },
    kmGazRazlika: { type: Number, default: 0 },
    kmGazPocetna: { type: Number, default: 0 },
    kmGaz: { type: Number, required: true },
    iznosRazlika: { type: Number, default: 0 },
    iznosPocetna: { type: Number, default: 0 },
    iznos: { type: Number, required: true },
    gotovina: { type: Number, default: 0 },
    plin: {
      racun: { type: Number, default: 0 },
      kilometraza: { type: Number, default: 0 },
    },
    benzin: { type: Number, default: 0 },
    kartica: [{ type: Number, default: 0 }],
    prekoRacuna: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    troskovi: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    umanjenje: [
      {
        iznos: { type: Number, default: 0 },
        opis: { type: String, default: "" },
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const NalogSchema = new mongoose.Schema(
  {
    kmSat: { type: String, required: true },
    password: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Start = mongoose.models.Start || mongoose.model("Start", StartSchema);
const Stop = mongoose.models.Stop || mongoose.model("Stop", StopSchema);
const Nalog = mongoose.models.Nalog || mongoose.model("Nalog", NalogSchema);

async function migrateData() {
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
    console.log("👤 Tražim admin korisnika...");
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log(
        "⚠️  Admin korisnik ne postoji. Prvo pokreni 'npm run create-admin'"
      );
      process.exit(1);
    }

    console.log(`✅ Admin korisnik pronađen: ${adminUser.name}\n`);

    // Migracija Start zapisa
    console.log("📊 Migriram Start zapise...");
    const startsWithoutUser = await Start.countDocuments({
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    if (startsWithoutUser > 0) {
      const startResult = await Start.updateMany(
        { $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId: adminUser._id } }
      );
      console.log(
        `  ✅ Ažurirano ${startResult.modifiedCount} Start zapisa`
      );
    } else {
      console.log("  ✅ Svi Start zapisi već imaju userId");
    }

    // Migracija Stop zapisa
    console.log("\n📊 Migriram Stop zapise...");
    const stopsWithoutUser = await Stop.countDocuments({
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    if (stopsWithoutUser > 0) {
      const stopResult = await Stop.updateMany(
        { $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId: adminUser._id } }
      );
      console.log(`  ✅ Ažurirano ${stopResult.modifiedCount} Stop zapisa`);
    } else {
      console.log("  ✅ Svi Stop zapisi već imaju userId");
    }

    // Migracija Nalog zapisa
    console.log("\n📊 Migriram Nalog zapise...");
    const naloziWithoutUser = await Nalog.countDocuments({
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    if (naloziWithoutUser > 0) {
      const nalogResult = await Nalog.updateMany(
        { $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId: adminUser._id } }
      );
      console.log(
        `  ✅ Ažurirano ${nalogResult.modifiedCount} Nalog zapisa`
      );
    } else {
      console.log("  ✅ Svi Nalog zapisi već imaju userId");
    }

    // Ažuriranje User modela za stare korisnike bez role
    console.log("\n👥 Ažuriram korisnike bez role polja...");
    const usersWithoutRole = await User.countDocuments({
      $or: [{ role: { $exists: false } }, { role: null }],
    });

    if (usersWithoutRole > 0) {
      const userResult = await User.updateMany(
        { $or: [{ role: { $exists: false } }, { role: null }] },
        { $set: { role: "user" } }
      );
      console.log(`  ✅ Ažurirano ${userResult.modifiedCount} korisnika`);
    } else {
      console.log("  ✅ Svi korisnici već imaju role");
    }

    // Prikaži statistiku
    console.log("\n" + "=".repeat(50));
    console.log("📊 STATISTIKA MIGRACIJE");
    console.log("=".repeat(50));

    const totalStarts = await Start.countDocuments();
    const totalStops = await Stop.countDocuments();
    const totalNalozi = await Nalog.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log(`Ukupno Start zapisa: ${totalStarts}`);
    console.log(`Ukupno Stop zapisa: ${totalStops}`);
    console.log(`Ukupno Nalog zapisa: ${totalNalozi}`);
    console.log(`Ukupno korisnika: ${totalUsers}`);
    console.log(`  - Admin: ${await User.countDocuments({ role: "admin" })}`);
    console.log(`  - User: ${await User.countDocuments({ role: "user" })}`);

    console.log("\n✅ Migracija uspešno završena!");
    console.log(
      "ℹ️  Svi postojeći zapisi su dodeljeni admin korisniku: " +
        adminUser.name
    );
    console.log(
      "\n💡 Možeš sada pokrenuti aplikaciju i testirati autentifikaciju!"
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Greška tokom migracije:", error);
    process.exit(1);
  }
}

migrateData();
