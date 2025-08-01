import { withTransaction } from '../config/database.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { Client } from '../models/Client.js';

export class ClientService {
  constructor() {
    this.repository = new ClientRepository();
  }

  async createClient(clientData) {
    // Validación de email único
    const emailExists = await this.checkEmailExists(clientData.email);
    if (emailExists) {
      throw new Error('El email ya está registrado');
    }

    return withTransaction(async (session) => {
      const client = await this.repository.create(clientData, session);
      console.log(`Cliente creado con ID: ${client._id}`);
      return client;
    });
  }

  async getClientById(id) {
    const client = await this.repository.findById(id);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }
    return client;
  }

  async listClients(activeOnly = true) {
    return this.repository.listAll(activeOnly);
  }

  async updateClient(id, updateData) {
    return withTransaction(async (session) => {
      // Verificar existencia primero
      await this.getClientById(id);
      
      // Si se actualiza el email, verificar que no exista
      if (updateData.email) {
        const emailExists = await this.checkEmailExists(updateData.email);
        if (emailExists) {
          throw new Error('El nuevo email ya está registrado');
        }
      }

      return this.repository.update(id, updateData, session);
    });
  }

  async deleteClient(id) {
    return withTransaction(async (session) => {
      const client = await this.getClientById(id);
      return this.repository.delete(client._id, session);
    });
  }

  async checkEmailExists(email) {
    const client = await this.repository.findByEmail(email);
    return !!client;
  }

  async searchClients(searchTerm) {
    // Implementación básica de búsqueda (puede mejorarse con índices)
    const allClients = await this.listClients(false);
    return allClients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  async addClientProject(clientId, projectId) {
    return withTransaction(async (session) => {
      const client = await this.getClientById(clientId, session);
      return this.repository.addProject(client._id, projectId, session);
    });
  }
}