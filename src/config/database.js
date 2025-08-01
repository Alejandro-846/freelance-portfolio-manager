import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance = null;

export async function connectDB() {
  if (dbInstance) return dbInstance;
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    dbInstance = client.db();
    console.log('✅ Connected to MongoDB');
    return dbInstance;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}