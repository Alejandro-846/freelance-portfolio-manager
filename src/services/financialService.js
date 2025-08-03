import { withTransaction } from '../config/database.js';
import { TransactionRepository } from '../repositories/transactionRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';

export class FinancialService {
  constructor() {
    this.transactionRepo = new TransactionRepository();
    this.clientRepo = new ClientRepository();
    this.projectRepo = new ProjectRepository();
  }

  async registerTransaction(transactionData, session = null) {
    return withTransaction(async (txSession) => {
      // Validaciones adicionales
      if (transactionData.projectId) {
        const project = await this.projectRepo.findById(
          transactionData.projectId, 
          txSession
        );
        if (!project) throw new Error('Proyecto no encontrado');
      }

      return this.transactionRepo.create(transactionData, txSession);
    }, session);
  }

  async getBalance(startDate, endDate, session = null) {
    const transactions = await this.transactionRepo.findByDateRange(
      startDate,
      endDate,
      session
    );

    return transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') {
        acc.income += t.amount;
        acc.net += t.amount;
      } else {
        acc.expenses += t.amount;
        acc.net -= t.amount;
      }
      return acc;
    }, { income: 0, expenses: 0, net: 0 });
  }

  async getClientFinancialReport(clientId, session = null) {
    const [transactions, client] = await Promise.all([
      this.transactionRepo.findByClient(clientId, session),
      this.clientRepo.findById(clientId, session)
    ]);

    if (!client) throw new Error('Cliente no encontrado');

    const report = {
      client: client.name,
      totalIncome: 0,
      totalExpenses: 0,
      transactions: []
    };

    transactions.forEach(t => {
      if (t.type === 'INCOME') {
        report.totalIncome += t.amount;
      } else {
        report.totalExpenses += t.amount;
      }
      report.transactions.push(t);
    });

    return report;
  }
}