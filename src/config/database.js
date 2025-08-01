import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// Singleton para manejar la conexión
let clientInstance = null;
let dbInstance = null;

export async function connectDB() {
  if (dbInstance) return dbInstance;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      retryWrites: true,
      retryReads: true
    });

    await client.connect();
    clientInstance = client;
    dbInstance = client.db();
    
    console.log(chalk.green('✅ Connected to MongoDB'));
    console.log(chalk.gray(`Database: ${dbInstance.databaseName}`));
    
    // Verificar conexión con ping
    await dbInstance.command({ ping: 1 });
    return dbInstance;
  } catch (error) {
    console.error(chalk.red('❌ MongoDB connection error:'), error.message);
    process.exit(1);
  }
}

// Para transacciones (requerimiento del proyecto)
export async function startSession() {
  if (!clientInstance) await connectDB();
  return clientInstance.startSession();
}

// Ejecutar operaciones con transacción
export async function withTransaction(fn) {
  const session = await startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

// Cierre seguro de la conexión
export async function closeConnection() {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
    dbInstance = null;
    console.log(chalk.yellow('🔌 MongoDB connection closed'));
  }
}

// Manejo de cierre de la aplicación
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});