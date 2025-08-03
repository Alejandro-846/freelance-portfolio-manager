import { connectDB } from '../config/database.js';
import { Deliverable } from '../models/Deliverable.js';

export class DeliverableRepository {
  constructor() {
    this.collectionName = 'deliverables';
  }

  async #getCollection() {
    const db = await connectDB();
    return db.collection(this.collectionName);
  }

  async create(deliverableData, session = null) {
    const collection = await this.#getCollection();
    const deliverable = new Deliverable(deliverableData);
    const result = await collection.insertOne(deliverable, { session });
    return { ...deliverable, _id: result.insertedId };
  }

  async findByProject(projectId, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    return collection.find({ 
      projectId: new ObjectId(projectId) 
    }, options).toArray();
  }

  async updateStatus(id, newStatus, feedback = '', session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 
        status: newStatus,
        feedback,
        updatedAt: new Date()
      } },
      options
    );
    return result.modifiedCount > 0;
  }
}