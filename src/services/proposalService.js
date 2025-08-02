import { ProposalRepository } from '../repositories/proposalRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ProjectService } from './projectService.js';
import { withTransaction } from '../config/database.js';

export class ProposalService {
  constructor() {
    this.proposalRepo = new ProposalRepository();
    this.clientRepo = new ClientRepository();
    this.projectService = new ProjectService();
  }

  async createProposal(proposalData) {
    return withTransaction(async (session) => {
      // Verificar que el cliente existe
      const client = await this.clientRepo.findById(proposalData.clientId, session);
      if (!client) throw new Error('Cliente no encontrado');

      // Crear la propuesta
      return this.proposalRepo.create(proposalData, session);
    });
  }

  async listClientProposals(clientId) {
    return this.proposalRepo.findByClient(clientId);
  }

  async listProposalsByStatus(status) {
    return this.proposalRepo.listByStatus(status);
  }

  async updateProposalStatus(proposalId, newStatus) {
    return withTransaction(async (session) => {
      return this.proposalRepo.updateStatus(proposalId, newStatus, session);
    });
  }

  async acceptProposal(proposalId) {
    return withTransaction(async (session) => {
      // 1. Cambiar estado de la propuesta
      const updated = await this.proposalRepo.updateStatus(
        proposalId, 
        'ACCEPTED', 
        session
      );
      
      if (!updated) throw new Error('No se pudo actualizar la propuesta');

      // 2. Crear proyecto automáticamente
      const proposal = await this.proposalRepo.findById(proposalId, session);
      const project = await this.projectService.createProjectFromProposal(
        proposalId,
        session
      );

      // 3. Actualizar propuesta con referencia al proyecto
      await this.proposalRepo.update(
        proposalId,
        { projectId: new ObjectId(project._id) },
        session
      );

      return project;
    });
  }

  async getProposalById(proposalId) {
    const proposal = await this.proposalRepo.findById(proposalId);
    if (!proposal) throw new Error('Propuesta no encontrada');
    return proposal;
  }
}