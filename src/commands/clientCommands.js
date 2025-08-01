import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClientService } from '../services/clientService.js';

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
        { name: chalk.yellow('Volver al Menú Principal'), value: 'back' }
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
        case 'back':
          return;
        default:
          console.log(chalk.yellow('\nOpción no implementada aún'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
    }
  }
}

async function handleCreateClient() {
  console.log(chalk.cyan('\n--- Crear Nuevo Cliente ---'));
  
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

  console.log(chalk.green('\n✅ Cliente creado exitosamente!'));
  console.log(chalk.gray('ID:'), createdClient._id);
}

async function handleListClients() {
  console.log(chalk.cyan('\n--- Listado de Clientes ---'));
  
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