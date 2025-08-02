import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClientService } from '../services/clientService.js';
import { displayError, displaySuccess, displaySectionTitle, confirmAction } from '../utils/helpers.js';

const clientService = new ClientService();

export async function clientMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\n=== Gestión de Clientes ==='),
      choices: [
        { name: 'Crear Cliente', value: 'create' },
        { name: 'Listar Clientes', value: 'list' },
        { name: 'Buscar Cliente', value: 'search' },
        { name: 'Actualizar Cliente', value: 'update' },
        { name: 'Eliminar Cliente', value: 'delete' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'create':
          await handleCreateClient();
          break;
        case 'list':
          await handleListClients();
          break;
        case 'search':
          await handleSearchClient();
          break;
        case 'update':
          await handleUpdateClient();
          break;
        case 'delete':
          await handleDeleteClient();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleCreateClient() {
  displaySectionTitle('Crear Nuevo Cliente');
  
  const clientData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nombre completo:',
      validate: input => input.trim().length >= 3 || 'Mínimo 3 caracteres'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: async (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) return 'Email inválido';
        const exists = await clientService.checkEmailExists(input);
        return !exists || 'Email ya registrado';
      }
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Teléfono:',
      validate: input => /^[0-9]{10,15}$/.test(input) || 'Debe tener 10-15 dígitos'
    },
    {
      type: 'input',
      name: 'company',
      message: 'Empresa (opcional):'
    }
  ]);

  const createdClient = await clientService.createClient({
    ...clientData,
    company: clientData.company || undefined
  });

  displaySuccess('\n✅ Cliente creado exitosamente!');
  console.log(chalk.gray('ID:'), createdClient._id);
}

async function handleListClients() {
  displaySectionTitle('Listado de Clientes');
  
  const clients = await clientService.listClients();
  
  if (clients.length === 0) {
    console.log(chalk.yellow('No hay clientes registrados.'));
    return;
  }

  clients.forEach(client => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), client._id);
    console.log(chalk.bold('Nombre:'), client.name);
    console.log(chalk.bold('Email:'), client.email);
    console.log(chalk.bold('Teléfono:'), client.phone);
    if (client.company) console.log(chalk.bold('Empresa:'), client.company);
    console.log(chalk.gray('Registrado el:'), client.createdAt.toLocaleDateString());
  });
}

async function handleSearchClient() {
  displaySectionTitle('Buscar Cliente');
  
  const { searchTerm } = await inquirer.prompt({
    type: 'input',
    name: 'searchTerm',
    message: 'Ingrese nombre, email o empresa:'
  });

  const results = await clientService.searchClients(searchTerm);
  
  if (results.length === 0) {
    console.log(chalk.yellow('No se encontraron coincidencias.'));
    return;
  }

  results.forEach(client => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('ID:'), client._id);
    console.log(chalk.bold('Nombre:'), client.name);
    console.log(chalk.bold('Email:'), client.email);
    if (client.company) console.log(chalk.bold('Empresa:'), client.company);
  });
}

async function handleUpdateClient() {
  displaySectionTitle('Actualizar Cliente');
  
  const clients = await clientService.listClients();
  const { clientId } = await inquirer.prompt({
    type: 'list',
    name: 'clientId',
    message: 'Seleccione cliente a actualizar:',
    choices: clients.map(c => ({
      name: `${c.name} (${c.email})`,
      value: c._id.toString()
    }))
  });

  const updateData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nuevo nombre:',
      validate: input => input.trim().length >= 3 || 'Mínimo 3 caracteres'
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Nuevo teléfono:',
      validate: input => /^[0-9]{10,15}$/.test(input) || '10-15 dígitos'
    },
    {
      type: 'input',
      name: 'company',
      message: 'Nueva empresa (opcional):'
    }
  ]);

  const confirmed = await confirmAction('¿Confirmar actualización?');
  if (confirmed) {
    await clientService.updateClient(clientId, {
      ...updateData,
      company: updateData.company || undefined
    });
    displaySuccess('Cliente actualizado correctamente!');
  }
}

async function handleDeleteClient() {
  displaySectionTitle('Eliminar Cliente');
  
  const clients = await clientService.listClients();
  const { clientId } = await inquirer.prompt({
    type: 'list',
    name: 'clientId',
    message: 'Seleccione cliente a eliminar:',
    choices: clients.map(c => ({
      name: `${c.name} (${c.email})`,
      value: c._id.toString()
    }))
  });

  const confirmed = await confirmAction('¿Confirmar eliminación? Esta acción es irreversible.');
  if (confirmed) {
    await clientService.deleteClient(clientId);
    displaySuccess('Cliente eliminado correctamente!');
  }
}