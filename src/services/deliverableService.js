import { DeliverableRepository } from '../repositories/deliverableRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { withTransaction } from '../config/database.js';
import { ObjectId } from 'mongodb';

export class DeliverableService {
  constructor() {
    this.deliverableRepo = new DeliverableRepository();
    this.projectRepo = new ProjectRepository();
  }

  async createDeliverable(deliverableData, session = null) {
    return withTransaction(async (txSession) => {
      // Validar proyecto
      const project = await this.projectRepo.findById(deliverableData.projectId, txSession);
      if (!project) throw new Error('Proyecto no encontrado');

      // Validar fecha
      if (new Date(deliverableData.deadline) < new Date()) {
        throw new Error('La fecha límite no puede ser en el pasado');
      }

      // Crear entregable
      const deliverable = await this.deliverableRepo.create(deliverableData, txSession);

      // Actualizar progreso del proyecto
      await this.#updateProjectProgress(deliverableData.projectId, txSession);

      return deliverable;
    }, session);
  }

  async updateDeliverableStatus(id, status, feedback = '', session = null) {
    return withTransaction(async (txSession) => {
      const validStatuses = ['DELIVERED', 'APPROVED', 'REJECTED', 'REVISION'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido. Use: ${validStatuses.join(', ')}`);
      }

      const deliverable = await this.deliverableRepo.findById(id, txSession);
      if (!deliverable) throw new Error('Entregable no encontrado');

      // Validar flujo de estados
      if (status === 'APPROVED' && deliverable.status !== 'DELIVERED') {
        throw new Error('Solo se puede aprobar un entregable en estado DELIVERED');
      }

      // Actualizar estado
      const updated = await this.deliverableRepo.updateStatus(
        id, 
        status, 
        feedback,
        txSession
      );

      if (updated) {
        // Actualizar progreso del proyecto
        await this.#updateProjectProgress(deliverable.projectId, txSession);
      }

      return updated;
    }, session);
  }

  async #updateProjectProgress(projectId, session) {
    const deliverables = await this.deliverableRepo.findByProject(projectId, session);
    const total = deliverables.length;
    const completed = deliverables.filter(d => 
      ['APPROVED', 'REJECTED'].includes(d.status)
    ).length;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return this.projectRepo.updateProgress(projectId, progress, session);
  }

  async rollbackDeliverable(deliverableId, session = null) {
    return withTransaction(async (txSession) => {
      const deliverable = await this.deliverableRepo.findById(deliverableId, txSession);
      if (!deliverable) throw new Error('Entregable no encontrado');

      // Solo se puede hacer rollback de entregables aprobados/rechazados
      if (!['APPROVED', 'REJECTED'].includes(deliverable.status)) {
        throw new Error('Solo se puede revertir entregables aprobados o rechazados');
      }

      // Revertir a estado anterior
      const result = await this.deliverableRepo.updateStatus(
        deliverableId,
        'DELIVERED',
        'Revertido por solicitud',
        txSession
      );

      if (result) {
        await this.#updateProjectProgress(deliverable.projectId, txSession);
      }

      return result;
    }, session);
  }
}