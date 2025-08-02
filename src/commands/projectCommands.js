import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectService } from '../services/projectService.js';
import { ClientService } from '../services/clientService.js';
import { displayError, displaySuccess, displaySectionTitle, confirmAction } from '../utils/helpers.js';

const projectService = new ProjectService();
const clientService = new ClientService();

export async function projectMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\n=== Gestión de Proyectos ==='),
      choices: [
        { name: 'Listar Proyectos Activos', value: 'list' },
        { name: 'Ver Proyectos por Cliente', value: 'by-client' },
        { name: 'Agregar Entregable', value: 'add-deliverable' },
        { name: 'Actualizar Estado', value: 'update-status' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'list':
          await handleListProjects();
          break;
        case 'by-client':
          await handleProjectsByClient();
          break;
        case 'add-deliverable':
          await handleAddDeliverable();
          break;
        case 'update-status':
          await handleUpdateStatus();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleListProjects() {
  displaySectionTitle('Proyectos Activos');
  const projects = await projectService.listActiveProjects();
  
  if (projects.length === 0) {
    console.log(chalk.yellow('No hay proyectos activos.'));
    return;
  }

  projects.forEach(p => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), p._id);
    console.log(chalk.bold('Nombre:'), p.name);
    console.log(chalk.bold('Cliente ID:'), p.clientId);
    console.log(chalk.bold('Presupuesto:'), `$${p.budget}`);
    console.log(chalk.bold('Estado:'), p.status);
    console.log(chalk.bold('Fecha Inicio:'), new Date(p.startDate).toLocaleDateString());
    console.log(chalk.bold('Fecha Límite:'), new Date(p.deadline).toLocaleDateString());
  });
}

async function handleProjectsByClient() {
  displaySectionTitle('Proyectos por Cliente');
  
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

  const projects = await projectService.listProjectsByClient(clientId);
  
  if (projects.length === 0) {
    console.log(chalk.yellow('No hay proyectos para este cliente.'));
    return;
  }

  projects.forEach(p => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), p._id);
    console.log(chalk.bold('Nombre:'), p.name);
    console.log(chalk.bold('Estado:'), p.status);
    console.log(chalk.bold('Entregables:'), p.deliverables.length);
  });
}

async function handleAddDeliverable() {
  displaySectionTitle('Agregar Entregable');
  
  const projects = await projectService.listActiveProjects();
  if (projects.length === 0) {
    console.log(chalk.yellow('No hay proyectos activos para agregar entregables.'));
    return;
  }

  const { projectId } = await inquirer.prompt({
    type: 'list',
    name: 'projectId',
    message: 'Seleccione proyecto:',
    choices: projects.map(p => ({
      name: `${p.name} (${p.clientId}) - $${p.budget}`,
      value: p._id
    }))
  });

  const deliverableData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nombre del entregable:',
      validate: input => input.trim().length >= 5 || 'Mínimo 5 caracteres'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descripción (opcional):'
    },
    {
      type: 'input',
      name: 'deadline',
      message: 'Fecha límite (YYYY-MM-DD):',
      validate: input => !isNaN(Date.parse(input)) || 'Fecha inválida'
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Notas adicionales (opcional):'
    }
  ]);

  const confirmed = await confirmAction('¿Confirmar agregar entregable?');
  if (confirmed) {
    await projectService.addProjectDeliverable(projectId, {
      ...deliverableData,
      deadline: new Date(deliverableData.deadline)
    });
    displaySuccess('Entregable agregado correctamente!');
  }
}

async function handleUpdateStatus() {
  displaySectionTitle('Actualizar Estado de Proyecto');
  
  const projects = await projectService.listActiveProjects();
  if (projects.length === 0) {
    console.log(chalk.yellow('No hay proyectos activos para actualizar.'));
    return;
  }

  const { projectId } = await inquirer.prompt({
    type: 'list',
    name: 'projectId',
    message: 'Seleccione proyecto:',
    choices: projects.map(p => ({
      name: `${p.name} (${p.status})`,
      value: p._id
    }))
  });

  const { newStatus } = await inquirer.prompt({
    type: 'list',
    name: 'newStatus',
    message: 'Nuevo estado:',
    choices: [
      { name: '🔄 Activo (ACTIVE)', value: 'ACTIVE' },
      { name: '⏸ Pausado (PAUSED)', value: 'PAUSED' },
      { name: '✅ Completado (COMPLETED)', value: 'COMPLETED' },
      { name: '❌ Cancelado (CANCELLED)', value: 'CANCELLED' }
    ]
  });

  const confirmed = await confirmAction(`¿Cambiar estado a ${newStatus}?`);
  if (confirmed) {
    await projectService.updateProjectStatus(projectId, newStatus);
    displaySuccess('Estado del proyecto actualizado correctamente!');
  }
}