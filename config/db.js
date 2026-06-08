import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/soar-engine`);
        console.log(`[DATABASE] 🗄️ MongoDB Connected successfully.`);
    } catch (error) {
        console.error(`[DATABASE CRITICAL] Connection failed:`, error);
        process.exit(1);
    }
};