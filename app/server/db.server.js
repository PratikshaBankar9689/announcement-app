import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  console.log("MongoDB URI:", uri ? "Found ✅" : "UNDEFINED ❌");
  
  await mongoose.connect(uri);
  isConnected = true;
  console.log("✅ MongoDB Connected");
}