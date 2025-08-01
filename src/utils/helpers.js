import chalk from 'chalk';
import { ObjectId } from 'mongodb';

// Helper para validar IDs de MongoDB
export function isValidId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

// Helper para formatear fechas
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

// Helper para mostrar errores consistentes
export function displayError(message, error) {
  console.error(chalk.red(`\n❌ ${message}`));
  if (error) console.error(chalk.gray(`Detalles: ${error.message}`));
  console.log(); // Espacio adicional
}

// Helper para mostrar éxito
export function displaySuccess(message) {
  console.log(chalk.green(`\n✅ ${message}`));
}

// Helper para títulos de sección
export function displaySectionTitle(title) {
  console.log(chalk.cyan.bold(`\n--- ${title} ---`));
}

// Helper para confirmaciones
export async function confirmAction(message) {
  const { confirmed } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirmed',
    message: chalk.yellow(message),
    default: false
  });
  return confirmed;
}