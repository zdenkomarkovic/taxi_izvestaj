const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    multiplier: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model("User", UserSchema);

async function addMultiplierToUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "taxi_izvestaj",
    });
    console.log("Connected to MongoDB (taxi_izvestaj)");

    // Ažuriraj sve korisnike koji nemaju multiplier polje
    const result = await User.updateMany(
      { multiplier: { $exists: false } },
      { $set: { multiplier: 1 } }
    );

    console.log(`Ažurirano ${result.modifiedCount} korisnika sa multiplier = 1`);

    // Prikaži sve korisnike
    const users = await User.find();
    console.log(`\nSvi korisnici (${users.length}):`);
    if (users.length === 0) {
      console.log("Nema korisnika u bazi!");
    } else {
      users.forEach((user) => {
        console.log(`- ${user.name}: multiplier = ${user.multiplier || "undefined"}`);
      });
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addMultiplierToUsers();
