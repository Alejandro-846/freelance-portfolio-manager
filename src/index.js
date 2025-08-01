#!/usr/bin/env node
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { clientMenu } from './commands/clientCommands.js';
import { proposalMenu } from './commands/proposalCommands.js';
import { connectDB, closeConnection } from './config/database.js';
import { displayError, displaySuccess } from './utils/helpers.js';


// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  displayError('Error no manejado:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  displayError('Excepción no capturada:', error);
  process.exit(1);
});




async function main() {
  try {
    // Configuración inicial
    await connectDB();
    displaySuccess('Bienvenido al Gestor de Portafolio Freelance');

    // Menú principal
    while (true) {
      const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: chalk.bold.blue('\nMENÚ PRINCIPAL'),
        choices: [
          { name: '👥 Gestión de Clientes', value: 'clients' },
          { name: '📄 Gestión de Propuestas', value: 'proposals' },
          { name: '📂 Gestión de Proyectos', value: 'projects' },
          { name: '📊 Reportes Financieros', value: 'reports' },
          { name: '🚪 Salir', value: 'exit' }
        ]
      });

      try {
        switch (action) {
          case 'clients':
            await clientMenu();
            break;
          case 'proposals':
            await proposalMenu();
            break;
          case 'exit':
            await closeConnection();
            displaySuccess('¡Hasta pronto!');
            process.exit(0);
          default:
            console.log(chalk.yellow('\nOpción no implementada aún'));
        }
      } catch (error) {
        displayError('Error en el menú:', error);
      }
    }
  } catch (error) {
    displayError('Error inicial:', error);
    process.exit(1);
  }
}

// Iniciar aplicación
main();