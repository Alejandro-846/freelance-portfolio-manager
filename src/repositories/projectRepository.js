import { ObjectId } from 'mongodb';
import { connectDB } from '../config/database.js';
import { Project } from '../models/Project.js';

export class ProjectRepository {
  constructor() {
    this.collectionName = 'projects';
  }

  async #getCollection() {
    const db = await connectDB();
    return db.collection(this.collectionName);
  }

  async create(projectData, session = null) {
    const collection = await this.#getCollection();
    const project = new Project(projectData);
    const result = await collection.insertOne(project, { session });
    return { ...project, _id: result.insertedId };
  }

  async findById(id, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const data = await collection.findOne(
      { _id: new ObjectId(id) },
      options
    );
    return data ? { ...data, _id: data._id.toString() } : null;
  }

  async findByClient(clientId, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const cursor = await collection.find({ 
      clientId: new ObjectId(clientId) 
    }, options);
    return (await cursor.toArray()).map(p => ({
      ...p,
      _id: p._id.toString(),
      clientId: p.clientId.toString(),
      proposalId: p.proposalId.toString()
    }));
  }

  async findByStatus(status, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const cursor = await collection.find({ status }, options);
    return (await cursor.toArray()).map(p => ({
      ...p,
      _id: p._id.toString(),
      clientId: p.clientId.toString(),
      proposalId: p.proposalId.toString()
    }));
  }

  async updateStatus(id, newStatus, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 
        status: newStatus,
        updatedAt: new Date() 
      } },
      options
    );
    return result.modifiedCount > 0;
  }

  async addDeliverable(projectId, deliverable, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId) },
      { $push: { deliverables: deliverable } },
      options
    );
    return result.modifiedCount > 0;
  }

  async updateDeliverableStatus(projectId, deliverableIndex, newStatus, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const key = `deliverables.${deliverableIndex}.status`;
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { 
        [key]: newStatus,
        [`deliverables.${deliverableIndex}.updatedAt`]: new Date(),
        updatedAt: new Date()
      } },
      options
    );
    return result.modifiedCount > 0;
  }
}