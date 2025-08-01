import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProposalService } from '../services/proposalService.js';
import { ClientService } from '../services/clientService.js';
import { displayError, displaySuccess, displaySectionTitle } from '../utils/helpers.js';

const proposalService = new ProposalService();
const clientService = new ClientService();

export async function proposalMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\nGestión de Propuestas'),
      choices: [
        { name: 'Crear Propuesta', value: 'create' },
        { name: 'Listar Propuestas por Cliente', value: 'list' },
        { name: 'Cambiar Estado de Propuesta', value: 'status' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'create':
          await handleCreateProposal();
          break;
        case 'list':
          await handleListProposals();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleCreateProposal() {
  displaySectionTitle('Crear Nueva Propuesta');
  
  // 1. Seleccionar cliente
  const clients = await clientService.listClients();
  const { clientId } = await inquirer.prompt({
    type: 'list',
    name: 'clientId',
    message: 'Seleccione el cliente:',
    choices: clients.map(c => ({
      name: `${c.name} (${c.email})`,
      value: c._id.toString()
    }))
  });

  // 2. Ingresar datos de la propuesta
  const proposalData = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Título de la propuesta:',
      validate: input => input.length >= 10 || 'Mínimo 10 caracteres'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descripción detallada:',
      validate: input => input.length >= 50 || 'Mínimo 50 caracteres'
    },
    {
      type: 'number',
      name: 'value',
      message: 'Valor ($):',
      validate: input => input > 0 || 'Debe ser un valor positivo'
    }
  ]);

  // 3. Confirmar y guardar
  const confirmed = await confirmAction('¿Confirmar creación de propuesta?');
  if (confirmed) {
    const proposal = await proposalService.createProposal({ 
      ...proposalData, 
      clientId 
    });
    displaySuccess('Propuesta creada con éxito!');
    console.log(chalk.gray(`ID: ${proposal._id}`));
  }
}