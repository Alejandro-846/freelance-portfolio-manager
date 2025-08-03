import { DeliverableRepository } from '../repositories/deliverableRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { withTransaction } from '../config/database.js';

export class DeliverableService {
  constructor() {
    this.deliverableRepo = new DeliverableRepository();
    this.projectRepo = new ProjectRepository();
  }

  async createDeliverable(deliverableData, session = null) {
    return withTransaction(async (txSession) => {
      // Validar que el proyecto existe
      const project = await this.projectRepo.findById(
        deliverableData.projectId, 
        txSession
      );
      if (!project) throw new Error('Proyecto no encontrado');

      return this.deliverableRepo.create(deliverableData, txSession);
    }, session);
  }

  async listProjectDeliverables(projectId, session = null) {
    return this.deliverableRepo.findByProject(projectId, session);
  }

  async reviewDeliverable(deliverableId, status, feedback = '', session = null) {
    const validStatuses = ['APPROVED', 'REJECTED', 'REVISION'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado no válido. Usar: ${validStatuses.join(', ')}`);
    }

    return this.deliverableRepo.updateStatus(
      deliverableId, 
      status, 
      feedback, 
      session
    );
  }
}