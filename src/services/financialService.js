import { withTransaction } from '../config/database.js';
import { ProjectRepository } from '../repositories/projectRepository.js';

export class FinancialService {
  constructor() {
    this.projectRepo = new ProjectRepository();
  }

  async getBalance() {
    const projects = await this.projectRepo.findByStatus('COMPLETED');
    
    const totalIncome = projects.reduce((sum, project) => sum + project.budget, 0);
    const totalExpenses = totalIncome * 0.3; // Simulación: 30% de gastos
    const net = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      net,
      currency: 'USD'
    };
  }

  async getClientIncome(clientId) {
    const projects = await this.projectRepo.findByClient(clientId);
    return projects
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, project) => sum + project.budget, 0);
  }

  async getExpensesByCategory() {
    // Simulación - implementar lógica real según necesidades
    return [
      { category: 'Desarrollo', amount: 2000 },
      { category: 'Diseño', amount: 1500 },
      { category: 'Infraestructura', amount: 1000 },
      { category: 'Marketing', amount: 800 }
    ];
  }
}