import chalk from 'chalk';
import inquirer from 'inquirer';
import { MongoClient } from 'mongodb';

/**
 * Muestra un mensaje de error formateado
 * @param {string} message - Mensaje principal
 * @param {Error} [error] - Objeto de error opcional
 */
export function displayError(message, error) {
  console.error(chalk.red(`\n❌ ${message}`));
  if (error) console.error(chalk.gray(`Detalles: ${error.message}`));
  console.log(); // Espacio adicional
}

/**
 * Muestra un mensaje de éxito formateado
 * @param {string} message - Mensaje a mostrar
 */
export function displaySuccess(message) {
  console.log(chalk.green(`\n✅ ${message}`));
}

/**
 * Muestra un título de sección formateado
 * @param {string} title - Título de la sección
 */
export function displaySectionTitle(title) {
  console.log(chalk.cyan(`\n--- ${title} ---`));
}

/**
 * Pide confirmación al usuario para una acción
 * @param {string} message - Mensaje de confirmación
 * @returns {Promise<boolean>} - True si el usuario confirma
 */
export async function confirmAction(message) {
  const { confirmed } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirmed',
    message: chalk.yellow(message),
    default: false
  });
  return confirmed;
}

/**
 * Valida si un string es un ObjectId válido
 * @param {string} id - ID a validar
 * @returns {boolean} - True si es válido
 */
export function isValidId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

/**
 * Formatea una fecha para mostrarla
 * @param {Date} date - Fecha a formatear
 * @param {boolean} [withTime=false] - Incluir hora
 * @returns {string} - Fecha formateada
 */
export function formatDate(date, withTime = false) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  return new Date(date).toLocaleDateString('es-ES', options);
}

/**
 * Muestra una tabla de datos en consola
 * @param {Array} data - Datos a mostrar
 * @param {Array} columns - Columnas a incluir
 */
export function displayTable(data, columns) {
  console.log(
    chalk.gray(
      data.map(item => 
        columns.map(col => `${chalk.bold(col)}: ${item[col]}`).join(' | ')
      ).join('\n')
    )
  );
}
export async function checkMongoConnection() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.serverStatus();
    return {
      connected: true,
      version: serverStatus.version,
      host: client.options.hosts[0].host
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

export async function checkExternalServices() {
  return {
    'MongoDB': await checkMongoConnection(),
    'Email Service': { status: 'Not Implemented' },
    'PDF Generator': { status: 'Active' }
  };
}