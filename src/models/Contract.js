import { z } from 'zod';

export const ContractStatus = z.enum([
  'DRAFT',
  'SENT',
  'SIGNED',
  'EXPIRED'
]);

export const ContractSchema = z.object({
  clientId: z.string(),
  proposalId: z.string().optional(),
  projectId: z.string().optional(),
  title: z.string().min(10),
  content: z.string().min(100),
  terms: z.array(z.string()).min(1),
  status: ContractStatus.default('DRAFT'),
  startDate: z.date(),
  endDate: z.date(),
  signedAt: z.date().optional(),
  pdfUrl: z.string().optional(),
  createdAt: z.date().default(() => new Date())
});

export class Contract {
  constructor(data) {
    const validatedData = ContractSchema.parse(data);
    Object.assign(this, validatedData);
  }
}