import inquirer from 'inquirer';
import chalk from 'chalk';
import { FinancialService } from '../services/financialService.js';
import { ClientService } from '../services/clientService.js';
import { displayError, displaySuccess, displaySectionTitle } from '../utils/helpers.js';

const financialService = new FinancialService();
const clientService = new ClientService();

export async function financialMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('\n=== Reportes Financieros ==='),
      choices: [
        { name: 'Balance General', value: 'balance' },
        { name: 'Ingresos por Cliente', value: 'income' },
        { name: 'Gastos por Categoría', value: 'expenses' },
        { name: 'Volver al Menú Principal', value: 'back' }
      ]
    });

    try {
      switch (action) {
        case 'balance':
          await handleBalanceReport();
          break;
        case 'income':
          await handleIncomeReport();
          break;
        case 'expenses':
          await handleExpensesReport();
          break;
        case 'back':
          return;
      }
    } catch (error) {
      displayError('Error:', error);
    }
  }
}

async function handleBalanceReport() {
  displaySectionTitle('Balance General');
  const balance = await financialService.getBalance();
  
  console.log(chalk.green('\n--------------------------------'));
  console.log(chalk.bold('Total Ingresos:'), chalk.green(`$${balance.totalIncome.toFixed(2)}`));
  console.log(chalk.bold('Total Gastos:'), chalk.red(`$${balance.totalExpenses.toFixed(2)}`));
  console.log(chalk.bold('Balance Neto:'), 
    balance.net > 0 ? chalk.green(`$${balance.net.toFixed(2)}`) : chalk.red(`$${balance.net.toFixed(2)}`));
}

async function handleIncomeReport() {
  displaySectionTitle('Ingresos por Cliente');
  
  const clients = await clientService.listClients();
  if (clients.length === 0) {
    console.log(chalk.yellow('No hay clientes registrados.'));
    return;
  }

  for (const client of clients) {
    const income = await financialService.getClientIncome(client._id.toString());
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('Cliente:'), client.name);
    console.log(chalk.bold('Email:'), client.email);
    console.log(chalk.bold('Ingresos:'), `$${income.toFixed(2)}`);
  }
}

async function handleExpensesReport() {
  displaySectionTitle('Gastos por Categoría');
  const expenses = await financialService.getExpensesByCategory();
  
  if (expenses.length === 0) {
    console.log(chalk.yellow('No hay datos de gastos disponibles.'));
    return;
  }

  expenses.forEach(expense => {
    console.log(chalk.green('\n--------------------------------'));
    console.log(chalk.bold('Categoría:'), expense.category);
    console.log(chalk.bold('Monto:'), `$${expense.amount.toFixed(2)}`);
  });
}