import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  return console.log("MONGODB_URI missing");
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "taxi_izvestaj" })
      .then((result) => {
        console.log("Connected to MongoDB");
        return result;
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB", error);
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
export default dbConnect;

// let isConnected: boolean = false;

// export const connectToDataBase = async () => {
//   mongoose.set("strictQuery", true);

//   if (!process.env.MONGODB_URI) {
//     return console.log("Missing MONGODB_URI");
//   }
//   if (isConnected) {
//     return console.log("MongoDB is already connected");
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       dbName: "taxi_izvestaj",
//     });
//     isConnected = true;
//     console.log("MongoDB is connected");
//   } catch (error) {
//     console.log("MongoDB connection failed", error);
//   }
// };
