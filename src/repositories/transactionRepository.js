import { connectDB } from '../config/database.js';
import { Transaction } from '../models/Transaction.js';

export class TransactionRepository {
  constructor() {
    this.collectionName = 'transactions';
  }

  async #getCollection() {
    const db = await connectDB();
    return db.collection(this.collectionName);
  }

  async create(transactionData, session = null) {
    const collection = await this.#getCollection();
    const transaction = new Transaction(transactionData);
    const result = await collection.insertOne(transaction, { session });
    return { ...transaction, _id: result.insertedId };
  }

  async findByClient(clientId, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    return collection.find({ 
      clientId: new ObjectId(clientId) 
    }, options).toArray();
  }

  async findByProject(projectId, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    return collection.find({ 
      projectId: new ObjectId(projectId) 
    }, options).toArray();
  }

  async findByDateRange(startDate, endDate, session = null) {
    const collection = await this.#getCollection();
    const options = session ? { session } : {};
    return collection.find({
      date: { $gte: startDate, $lte: endDate }
    }, options).toArray();
  }

  async getBalanceByClient(clientId, session = null) {
    const transactions = await this.findByClient(clientId, session);
    return this.#calculateBalance(transactions);
  }

  async getBalanceByProject(projectId, session = null) {
    const transactions = await this.findByProject(projectId, session);
    return this.#calculateBalance(transactions);
  }

  async #calculateBalance(transactions) {
    return transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') {
        acc.income += t.amount;
        acc.balance += t.amount;
      } else {
        acc.expenses += t.amount;
        acc.balance -= t.amount;
      }
      return acc;
    }, { income: 0, expenses: 0, balance: 0 });
  }
}