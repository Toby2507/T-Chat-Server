import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(String(process.env.DATABASE_URI));
    } catch (err) { process.exit(1); }
};

export default connectDB;