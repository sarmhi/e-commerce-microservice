import mongoose from 'mongoose';
import keys from './keys';

export const connectDB = async () => {
  try {
    await mongoose.connect(keys.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
