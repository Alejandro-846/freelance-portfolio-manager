import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const DeliverableStatus = z.enum([
  'PENDING',
  'DELIVERED', 
  'APPROVED',
  'REJECTED',
  'REVISION'
]);

export const DeliverableSchema = z.object({
  projectId: z.instanceof(ObjectId),
  name: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  deadline: z.date(),
  status: DeliverableStatus.default('PENDING'),
  attachments: z.array(z.string()).default([]), // URLs de archivos
  feedback: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export class Deliverable {
  constructor(data) {
    const validatedData = DeliverableSchema.parse({
      ...data,
      projectId: new ObjectId(data.projectId)
    });
    Object.assign(this, validatedData);
  }
}