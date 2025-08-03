#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import { clientMenu } from './commands/clientCommands.js';
import { proposalMenu } from './commands/proposalCommands.js';
import { projectMenu } from './commands/projectCommands.js';
import { financialMenu } from './commands/financialCommands.js';
import { deliverableMenu } from './commands/deliverableCommands.js';
import { contractMenu } from './commands/contractCommands.js';
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
          { name: '📝 Entregables', value: 'deliverables' },
          { name: '📑 Contratos', value: 'contracts' },
          { name: '💰 Gestión Financiera', value: 'financial' },
          { name: '🚪 Salir', value: 'exit' }
        ],
        pageSize: 10
      });

      try {
        switch (action) {
          case 'clients':
            await clientMenu();
            break;
          case 'proposals':
            await proposalMenu();
            break;
          case 'projects':
            await projectMenu();
            break;
          case 'deliverables':
            await deliverableMenu();
            break;
          case 'contracts':
            await contractMenu();
            break;
          case 'financial':
            await financialMenu();
            break;
          case 'exit':
            await closeConnection();
            displaySuccess('¡Hasta pronto!');
            process.exit(0);
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
