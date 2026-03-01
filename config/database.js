import mongoose from 'mongoose';
import API_CONSTANT from '../constants/constant.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(API_CONSTANT.MONGO_URI);
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
