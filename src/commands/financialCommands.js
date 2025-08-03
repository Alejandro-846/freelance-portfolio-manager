import inquirer from 'inquirer';
import chalk from 'chalk';
import { FinancialService } from '../services/financialService.js';
import { ClientService } from '../services/clientService.js';
import { ProjectService } from '../services/projectService.js';
import { displayError, displaySuccess, displaySectionTitle } from '../utils/helpers.js';

const financialService = new FinancialService();
const clientService = new ClientService();
const projectService = new ProjectService();

export async function financialMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\n=== Gestión Financiera ==='),
      choices: [
        { name: 'Registrar Transacción', value: 'register' },
        { name: 'Balance por Cliente', value: 'client' },
        { name: 'Balance por Proyecto', value: 'project' },
        { name: 'Reporte Financiero', value: 'report' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'register':
          await handleRegisterTransaction();
          break;
        case 'client':
          await handleClientBalance();
          break;
        case 'project':
          await handleProjectBalance();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleRegisterTransaction() {
  displaySectionTitle('Registrar Transacción');

  // Seleccionar cliente
  const clients = await clientService.listClients();
  const { clientId } = await inquirer.prompt({
    type: 'list',
    name: 'clientId',
    message: 'Seleccione cliente:',
    choices: clients.map(c => ({
      name: `${c.name} (${c.email})`,
      value: c._id.toString()
    }))
  });

  // Seleccionar proyecto (opcional)
  const projects = await projectService.listClientProjects(clientId);
  let projectId = null;
  if (projects.length > 0) {
    const { useProject } = await inquirer.prompt({
      type: 'confirm',
      name: 'useProject',
      message: '¿Asociar a un proyecto?',
      default: false
    });

    if (useProject) {
      const { selectedProjectId } = await inquirer.prompt({
        type: 'list',
        name: 'selectedProjectId',
        message: 'Seleccione proyecto:',
        choices: projects.map(p => ({
          name: `${p.name} (${p._id})`,
          value: p._id.toString()
        }))
      });
      projectId = selectedProjectId;
    }
  }

  // Datos de la transacción
  const transactionData = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Tipo de transacción:',
      choices: [
        { name: 'Ingreso', value: 'INCOME' },
        { name: 'Gasto', value: 'EXPENSE' }
      ]
    },
    {
      type: 'number',
      name: 'amount',
      message: 'Monto:',
      validate: input => input > 0 || 'Debe ser un valor positivo'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descripción:',
      validate: input => input.length >= 5 || 'Mínimo 5 caracteres'
    },
    {
      type: 'list',
      name: 'method',
      message: 'Método de pago:',
      choices: [
        'TRANSFER', 'CASH', 'CREDIT_CARD', 'CRYPTO', 'OTHER'
      ]
    }
  ]);

  const transaction = await financialService.registerTransaction({
    ...transactionData,
    clientId,
    projectId
  });

  displaySuccess('Transacción registrada con éxito!');
  console.log(chalk.gray(`ID: ${transaction._id}`));
}