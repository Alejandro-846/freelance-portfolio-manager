#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import { asciiBanner } from './utils/banner.js';
import { clientMenu } from './commands/clientCommands.js';
import { proposalMenu } from './commands/proposalCommands.js';
import { projectMenu } from './commands/projectCommands.js';
import { financialMenu } from './commands/financialCommands.js';
import { deliverableMenu } from './commands/deliverableCommands.js';
import { contractMenu } from './commands/contractCommands.js';
import { connectDB, closeConnection } from './config/database.js';
import { displayError, displaySuccess, checkMongoConnection, checkExternalServices } from './utils/helpers.js';

// Configuración de eventos globales
process.on('unhandledRejection', (error) => {
  displayError('Error no manejado:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  displayError('Excepción no capturada:', error);
  process.exit(1);
});

// Función principal
async function main() {
  try {
    // Verificar conexión antes de mostrar banner
    const dbStatus = await checkMongoConnection();
    if (!dbStatus.connected) {
      displayError(`Error de MongoDB: ${dbStatus.error}`);
      process.exit(1);
    }

    console.clear();
    console.log(chalk.cyan(asciiBanner));
    displaySuccess('✅ Sistema de Gestión Freelance');
    console.log(chalk.gray(`Versión: 1.0.0 | MongoDB: ${dbStatus.version}`));

    // Menú principal interactivo
    while (true) {
      const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: chalk.bold.magenta('\nMENÚ PRINCIPAL'),
        choices: [
          { name: `${chalk.green('›')} 👥 Gestión de Clientes`, value: 'clients' },
          { name: `${chalk.green('›')} 📄 Gestión de Propuestas`, value: 'proposals' },
          { name: `${chalk.green('›')} 📂 Gestión de Proyectos`, value: 'projects' },
          { name: `${chalk.green('›')} 📝 Gestión de Contratos`, value: 'contracts' },
          { name: `${chalk.green('›')} 🧾 Entregables`, value: 'deliverables' },
          { name: `${chalk.green('›')} 💰 Reportes Financieros`, value: 'financial' },
          new inquirer.Separator(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━')),
          { 
            name: `${chalk.yellow('⚙️')} Configuración del Sistema`, 
            value: 'config' 
          },
          { 
            name: `${chalk.red('↩')} Salir del Programa`, 
            value: 'exit' 
          }
        ],
        pageSize: 12,
        loop: false
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
          case 'contracts':
            await contractMenu();
            break;
          case 'deliverables':
            await deliverableMenu();
            break;
          case 'financial':
            await financialMenu();
            break;
          case 'config':
            await handleSystemConfig();
            break;
          case 'exit':
            await handleExit();
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

// Funciones auxiliares
async function handleSystemConfig() {
  const { configAction } = await inquirer.prompt({
    type: 'list',
    name: 'configAction',
    message: 'Configuración del Sistema',
    choices: [
      { name: 'Ver estado de conexiones', value: 'status' },
      { name: 'Probar servicios externos', value: 'test' },
      { name: 'Volver', value: 'back' }
    ]
  });

  if (configAction === 'status') {
    const services = await checkExternalServices();
    console.table(services);
  }
}

async function handleExit() {
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: '¿Estás seguro que deseas salir?',
    default: false
  });

  if (confirm) {
    await closeConnection();
    displaySuccess('¡Hasta pronto! 👋');
    process.exit(0);
  }
}

// Iniciar aplicación
main();