import { withTransaction } from '../config/database.js';
import { ProposalRepository } from '../repositories/proposalRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';

export class ProjectService {
  constructor() {
    this.proposalRepo = new ProposalRepository();
    this.projectRepo = new ProjectRepository();
    this.clientRepo = new ClientRepository();
  }

  async createProjectFromProposal(proposalId, session = null) {
    return withTransaction(async (txSession) => {
      const currentSession = session || txSession;

      // 1. Obtener y validar propuesta
      const proposal = await this.proposalRepo.findById(proposalId, currentSession);
      if (!proposal) throw new Error('Propuesta no encontrada');
      if (proposal.status !== 'ACCEPTED') {
        throw new Error('Solo se pueden crear proyectos de propuestas aceptadas');
      }

      // 2. Verificar que el cliente existe
      const client = await this.clientRepo.findById(proposal.clientId, currentSession);
      if (!client) throw new Error('Cliente asociado no encontrado');

      // 3. Crear estructura del proyecto
      const projectData = {
        name: `Proyecto: ${proposal.title.substring(0, 50)}`,
        description: `Derivado de la propuesta: ${proposal.description.substring(0, 200)}`,
        clientId: proposal.clientId,
        proposalId: proposalId,
        budget: proposal.value,
        status: 'PLANNING',
        startDate: new Date(),
        deadline: new Date(proposal.deliveryDate)
      };

      // 4. Guardar el proyecto
      const project = await this.projectRepo.create(projectData, currentSession);

      // 5. Actualizar cliente con referencia al proyecto
      await this.clientRepo.addProject(
        proposal.clientId,
        project._id.toString(),
        currentSession
      );

      return project;
    }, session);
  }

  async listActiveProjects() {
    return this.projectRepo.findByStatus('ACTIVE');
  }

  async listProjectsByClient(clientId) {
    return this.projectRepo.findByClient(clientId);
  }

  async getProjectById(projectId) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Proyecto no encontrado');
    return project;
  }

  async addProjectDeliverable(projectId, deliverableData) {
    return withTransaction(async (session) => {
      const project = await this.getProjectById(projectId);
      
      const deliverable = {
        name: deliverableData.name,
        description: deliverableData.description || '',
        deadline: new Date(deliverableData.deadline),
        status: 'PENDING',
        notes: deliverableData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const added = await this.projectRepo.addDeliverable(
        projectId,
        deliverable,
        session
      );

      if (!added) throw new Error('No se pudo agregar el entregable');
      return deliverable;
    });
  }

  async updateProjectStatus(projectId, newStatus) {
    return withTransaction(async (session) => {
      return this.projectRepo.updateStatus(projectId, newStatus, session);
    });
  }

  async updateDeliverableStatus(projectId, deliverableIndex, newStatus) {
    return withTransaction(async (session) => {
      return this.projectRepo.updateDeliverableStatus(
        projectId,
        deliverableIndex,
        newStatus,
        session
      );
    });
  }
}