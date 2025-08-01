import { connectDB } from './config/database.js';

async function main() {
  await connectDB();
  console.log('Aplicación iniciada correctamente');
}

main().catch(console.error);