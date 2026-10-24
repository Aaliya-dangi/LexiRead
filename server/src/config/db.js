import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    isConnected = false;
    console.log('[Database] Running in standalone in-memory mode (no external MongoDB required).');
    return;
  }

  const targetUri = uri || 'mongodb://localhost:27017/dyslexia_assistant';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${targetUri}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Connection notice: Unable to connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB] Running with in-memory persistence fallback for seamless standalone execution.`);
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  ready: mongoose.connection.readyState === 1
});
