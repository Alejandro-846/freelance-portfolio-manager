import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProposalService } from '../services/proposalService.js';
import { ClientService } from '../services/clientService.js';
import { displayError, displaySuccess, displaySectionTitle, confirmAction } from '../utils/helpers.js';

const proposalService = new ProposalService();
const clientService = new ClientService();

export async function proposalMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\n=== Gestión de Propuestas ==='),
      choices: [
        { name: 'Crear Propuesta', value: 'create' },
        { name: 'Listar Propuestas por Cliente', value: 'list' },
        { name: 'Cambiar Estado de Propuesta', value: 'status' },
        { name: 'Aceptar Propuesta (crea proyecto)', value: 'accept' },
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
        case 'status':
          await handleChangeStatus();
          break;
        case 'accept':
          await handleAcceptProposal();
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
  if (clients.length === 0) {
    console.log(chalk.yellow('No hay clientes registrados. Crea un cliente primero.'));
    return;
  }

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
    },
    {
      type: 'input',
      name: 'deliveryDate',
      message: 'Fecha de entrega (YYYY-MM-DD):',
      validate: input => !isNaN(Date.parse(input)) || 'Fecha inválida'
    }
  ]);

  // 3. Confirmar y guardar
  const confirmed = await confirmAction('¿Confirmar creación de propuesta?');
  if (confirmed) {
    const proposal = await proposalService.createProposal({ 
      ...proposalData,
      clientId,
      deliveryDate: new Date(proposalData.deliveryDate)
    });
    displaySuccess('Propuesta creada con éxito!');
    console.log(chalk.gray(`ID: ${proposal._id}`));
  }
}

async function handleListProposals() {
  displaySectionTitle('Listar Propuestas por Cliente');
  
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

  const proposals = await proposalService.listClientProposals(clientId);
  
  if (proposals.length === 0) {
    console.log(chalk.yellow('No hay propuestas para este cliente.'));
    return;
  }

  proposals.forEach(p => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), p._id);
    console.log(chalk.bold('Título:'), p.title);
    console.log(chalk.bold('Valor:'), `$${p.value}`);
    console.log(chalk.bold('Estado:'), p.status);
    console.log(chalk.bold('Fecha Entrega:'), new Date(p.deliveryDate).toLocaleDateString());
    if (p.projectId) console.log(chalk.bold('Proyecto ID:'), p.projectId);
  });
}

async function handleChangeStatus() {
  displaySectionTitle('Cambiar Estado de Propuesta');
  
  const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'ARCHIVED'];
  const proposals = await proposalService.listProposalsByStatus('DRAFT');
  
  if (proposals.length === 0) {
    console.log(chalk.yellow('No hay propuestas disponibles para cambiar estado.'));
    return;
  }

  const { proposalId } = await inquirer.prompt({
    type: 'list',
    name: 'proposalId',
    message: 'Seleccione propuesta:',
    choices: proposals.map(p => ({
      name: `${p.title} (${p.status}) - Cliente: ${p.clientId}`,
      value: p._id
    }))
  });

  const { newStatus } = await inquirer.prompt({
    type: 'list',
    name: 'newStatus',
    message: 'Nuevo estado:',
    choices: statuses.map(s => ({
      name: s,
      value: s
    }))
  });

  const confirmed = await confirmAction(`¿Cambiar estado a ${newStatus}?`);
  if (confirmed) {
    await proposalService.updateProposalStatus(proposalId, newStatus);
    displaySuccess('Estado actualizado correctamente!');
  }
}

async function handleAcceptProposal() {
  displaySectionTitle('Aceptar Propuesta');
  
  const proposals = await proposalService.listProposalsByStatus('SENT');
  if (proposals.length === 0) {
    console.log(chalk.yellow('No hay propuestas en estado SENT para aceptar.'));
    return;
  }

  const { proposalId } = await inquirer.prompt({
    type: 'list',
    name: 'proposalId',
    message: 'Seleccione propuesta a aceptar:',
    choices: proposals.map(p => ({
      name: `${p.title} - $${p.value} (Cliente: ${p.clientId})`,
      value: p._id
    }))
  });

  const confirmed = await confirmAction('¿Aceptar esta propuesta y crear proyecto?');
  if (confirmed) {
    const project = await proposalService.acceptProposal(proposalId);
    displaySuccess('Propuesta aceptada y proyecto creado!');
    console.log(chalk.gray('ID Proyecto:'), project._id);
  }
}