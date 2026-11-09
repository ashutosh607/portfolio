import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<db_username>')) {
    console.warn('\n⚠️ [Database] MONGO_URI contains unconfigured placeholder <db_username>.');
    console.warn('👉 Please update .env with your actual MongoDB Atlas database username to connect.\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, bufferCommands: false });
    console.log(`🍃 [Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ [Database] Connection Error: ${error.message}`);
    return false;
  }
};

