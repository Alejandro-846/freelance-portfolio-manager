import inquirer from 'inquirer';
import chalk from 'chalk';
import { DeliverableService } from '../services/deliverableService.js';
import { ProjectService } from '../services/projectService.js';
import { displayError, displaySuccess, displaySectionTitle } from '../utils/helpers.js';

const deliverableService = new DeliverableService();
const projectService = new ProjectService();

export async function deliverableMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\nGestión de Entregables'),
      choices: [
        { name: 'Crear Entregable', value: 'create' },
        { name: 'Listar por Proyecto', value: 'list' },
        { name: 'Revisar Entregable', value: 'review' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'create':
          await handleCreateDeliverable();
          break;
        case 'list':
          await handleListDeliverables();
          break;
        case 'review':
          await handleReviewDeliverable();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleCreateDeliverable() {
  displaySectionTitle('Nuevo Entregable');
  
  const projects = await projectService.listActiveProjects();
  const { projectId } = await inquirer.prompt({
    type: 'list',
    name: 'projectId',
    message: 'Seleccione proyecto:',
    choices: projects.map(p => ({
      name: `${p.name} (${p._id})`,
      value: p._id.toString()
    }))
  });

  const deliverableData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nombre del entregable:',
      validate: input => input.length >= 5 || 'Mínimo 5 caracteres'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descripción:'
    },
    {
      type: 'input',
      name: 'deadline',
      message: 'Fecha límite (YYYY-MM-DD):',
      validate: input => !isNaN(Date.parse(input)) || 'Fecha inválida'
    }
  ]);

  const deliverable = await deliverableService.createDeliverable({
    ...deliverableData,
    projectId,
    deadline: new Date(deliverableData.deadline)
  });

  displaySuccess('Entregable creado!');
  console.log(chalk.gray(`ID: ${deliverable._id}`));
}

async function handleListDeliverables() {
  displaySectionTitle('Entregables por Proyecto');
  
  const projects = await projectService.listActiveProjects();
  const { projectId } = await inquirer.prompt({
    type: 'list',
    name: 'projectId',
    message: 'Seleccione proyecto:',
    choices: projects.map(p => ({
      name: `${p.name} (${p._id})`,
      value: p._id.toString()
    }))
  });

  const deliverables = await deliverableService.listProjectDeliverables(projectId);
  
  deliverables.forEach(d => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), d._id);
    console.log(chalk.bold('Nombre:'), d.name);
    console.log(chalk.bold('Estado:'), 
      d.status === 'APPROVED' ? chalk.green(d.status) : 
      d.status === 'REJECTED' ? chalk.red(d.status) : 
      chalk.yellow(d.status));
    console.log(chalk.bold('Fecha Límite:'), d.deadline.toLocaleDateString());
  });
}