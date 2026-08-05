import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atl_website';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Database connection failed (${error.message}). Running in hybrid/fallback mode.`);
    return false;
  }
};
