import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atl_website';
  
  const tryConnect = async () => {
    return await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
  };

  try {
    const conn = await tryConnect();
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (initialError: any) {
    // If SRV lookup failed (e.g. querySrv ECONNREFUSED on Windows), retry with fallback DNS servers
    if (initialError?.code === 'ECONNREFUSED' || initialError?.syscall === 'querySrv') {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await tryConnect();
        console.log(`[MongoDB] Connected successfully via DNS fallback to host: ${conn.connection.host}`);
        return true;
      } catch (retryError: any) {
        console.warn(`[MongoDB Warning] Database connection failed (${retryError.message}). Running in hybrid/fallback mode.`);
        return false;
      }
    }
    console.warn(`[MongoDB Warning] Database connection failed (${initialError.message}). Running in hybrid/fallback mode.`);
    return false;
  }
};
