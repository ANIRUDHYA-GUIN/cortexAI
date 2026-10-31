import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Gateway MongoDB connected successfully");
    } catch (error) {
        console.error("Gateway MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;