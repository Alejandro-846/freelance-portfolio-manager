import { ObjectId } from 'mongodb';
import { connectDB, withTransaction } from '../config/database.js';
import { Client } from '../models/Client.js';

export class ClientRepository {
  constructor() {
    this.collectionName = 'clients';
  }

  async #getCollection() {
    const db = await connectDB();
    return db.collection(this.collectionName);
  }

  async create(clientData) {
    const collection = await this.#getCollection();
    const client = new Client(clientData);
    const result = await collection.insertOne(client);
    return Client.fromDB({ ...client, _id: result.insertedId });
  }

  async findById(id, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const data = await collection.findOne(
      { _id: new ObjectId(id) },
      options
    );
    return data ? Client.fromDB(data) : null;
  }

  async findByEmail(email, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const data = await collection.findOne(
      { email: email.toLowerCase() },
      options
    );
    return data ? Client.fromDB(data) : null;
  }

  async listAll(activeOnly = true, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const query = activeOnly ? { isActive: true } : {};
    
    const cursor = collection.find(query, options);
    return (await cursor.toArray()).map(Client.fromDB);
  }

  async update(id, updateData, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    
    // Validamos los datos de actualización
    const client = await this.findById(id);
    if (!client) throw new Error('Client not found');
    
    client.update(updateData);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: client },
      options
    );
    
    return result.modifiedCount > 0 ? client : null;
  }

  async delete(id, session = null) {
    return this.update(id, { isActive: false }, session);
  }

  async addProject(clientId, projectId, session = null) {
    return withTransaction(async (txSession) => {
      const collection = await this.#getCollection();
      const client = await this.findById(clientId, txSession);
      
      if (!client) throw new Error('Client not found');
      
      client.addProject(projectId);
      
      await collection.updateOne(
        { _id: new ObjectId(clientId) },
        { $set: { projects: client.projects } },
        { session: txSession }
      );
      
      return client;
    }, session);
  }
}