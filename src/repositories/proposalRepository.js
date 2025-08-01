import { connectDB } from '../config/database.js';
import { Proposal } from '../models/Proposal.js';

export class ProposalRepository {
  constructor() {
    this.collectionName = 'proposals';
  }

  async #getCollection() {
    const db = await connectDB();
    return db.collection(this.collectionName);
  }

  async create(proposalData, session = null) {
    const collection = await this.#getCollection();
    const proposal = new Proposal(proposalData);
    const result = await collection.insertOne(proposal, { session });
    return { ...proposal, _id: result.insertedId };
  }

  async findByClient(clientId, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const cursor = await collection.find({ 
      clientId: new ObjectId(clientId) 
    }, options);
    return cursor.toArray();
  }

  async updateStatus(id, newStatus, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: newStatus, updatedAt: new Date() } },
      options
    );
    return result.modifiedCount > 0;
  }
}