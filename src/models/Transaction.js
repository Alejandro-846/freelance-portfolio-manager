import { z } from 'zod';

export const TransactionType = z.enum([
  'INCOME',
  'EXPENSE'
]);

export const PaymentMethod = z.enum([
  'CASH',
  'TRANSFER',
  'CREDIT_CARD',
  'CRYPTO'
]);

export const TransactionSchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  type: TransactionType,
  amount: z.number().positive(),
  description: z.string().max(200),
  method: PaymentMethod.default('TRANSFER'),
  date: z.date().default(() => new Date()),
  category: z.string().max(50).optional(),
  invoiceNumber: z.string().max(20).optional()
});

export class Transaction {
  constructor(data) {
    const validatedData = TransactionSchema.parse(data);
    Object.assign(this, validatedData);
  }
}