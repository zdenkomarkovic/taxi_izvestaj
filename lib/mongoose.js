import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    return console.log("Missing MONGODB_URL");
  }

  // Proveri da li je Mongoose već konektovan
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB is already connected");
    return;
  }

  // Proveri da li je konekcija u toku
  if (mongoose.connection.readyState === 2) {
    console.log("MongoDB connection is in progress");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "taxi_izvestaj",
      maxPoolSize: 10, // Povećaj pool size za bolje performanse
      serverSelectionTimeoutMS: 5000, // Smanji timeout da brže падне ako ne može da se poveže
      socketTimeoutMS: 45000,
    });
    isConnected = true;

    console.log("MongoDB is connected");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
