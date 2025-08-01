import { ProposalRepository } from '../repositories/proposalRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { withTransaction } from '../config/database.js';

export class ProposalService {
  constructor() {
    this.proposalRepo = new ProposalRepository();
    this.clientRepo = new ClientRepository();
  }

  async createProposal(proposalData) {
    return withTransaction(async (session) => {
      // 1. Verificar que el cliente existe
      const client = await this.clientRepo.findById(proposalData.clientId, session);
      if (!client) throw new Error('Cliente no encontrado');

      // 2. Crear la propuesta
      return this.proposalRepo.create(proposalData, session);
    });
  }

  async listClientProposals(clientId) {
    return this.proposalRepo.findByClient(clientId);
  }

  async acceptProposal(proposalId) {
    return this.proposalRepo.updateStatus(proposalId, 'ACCEPTED');
  }
}