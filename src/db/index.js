import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    const connectionInstance =    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("MongoDB connected successfully DB HOST:`${connectionInstance.connection.host}`");
  } catch (error) {
    console.error("MONGODB CONNECTION ERROR: ", error);
    process.exit(1);  //READ About process.exit() method
  }
}


export default connectDB;