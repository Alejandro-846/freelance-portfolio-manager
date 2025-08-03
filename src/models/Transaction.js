import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const TransactionType = z.enum([
  'INCOME', 
  'EXPENSE'
]);

export const PaymentMethod = z.enum([
  'CASH',
  'TRANSFER',
  'CREDIT_CARD',
  'CRYPTO',
  'OTHER'
]);

export const TransactionSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  projectId: z.instanceof(ObjectId).optional(),
  clientId: z.instanceof(ObjectId),
  type: TransactionType,
  amount: z.number().positive(),
  description: z.string().min(5).max(200),
  method: PaymentMethod.default('TRANSFER'),
  date: z.date().default(() => new Date()),
  category: z.string().max(50).optional(),
  invoiceNumber: z.string().max(20).optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  createdAt: z.date().default(() => new Date())
});

export class Transaction {
  constructor(data) {
    const validatedData = TransactionSchema.parse({
      ...data,
      clientId: new ObjectId(data.clientId),
      projectId: data.projectId ? new ObjectId(data.projectId) : undefined
    });
    Object.assign(this, validatedData);
  }
}