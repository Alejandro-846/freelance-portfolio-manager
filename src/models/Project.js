import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ProjectStatus = z.enum([
  'PLANNING',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
]);

export const DeliverableStatus = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'DELIVERED',
  'APPROVED',
  'REJECTED'
]);

export const ProjectSchema = z.object({
  name: z.string()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  clientId: z.instanceof(ObjectId),
  proposalId: z.instanceof(ObjectId),
  budget: z.number()
    .positive("El presupuesto debe ser positivo"),
  status: ProjectStatus.default('PLANNING'),
  startDate: z.date(),
  deadline: z.date(),
  deliverables: z.array(z.object({
    name: z.string()
      .min(5, "El nombre debe tener al menos 5 caracteres"),
    description: z.string()
      .max(300, "La descripción no puede exceder 300 caracteres")
      .optional(),
    deadline: z.date(),
    status: DeliverableStatus.default('PENDING'),
    notes: z.string().optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
  })).default([]),
  payments: z.array(z.object({
    amount: z.number().positive(),
    date: z.date(),
    method: z.string(),
    reference: z.string(),
    createdAt: z.date().default(() => new Date())
  })).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export class Project {
  constructor(data) {
    const validatedData = ProjectSchema.parse({
      ...data,
      clientId: new ObjectId(data.clientId),
      proposalId: new ObjectId(data.proposalId),
      startDate: new Date(data.startDate),
      deadline: new Date(data.deadline),
      deliverables: data.deliverables?.map(d => ({
        ...d,
        deadline: new Date(d.deadline)
      })) || [],
      payments: data.payments?.map(p => ({
        ...p,
        date: new Date(p.date)
      })) || []
    });
    Object.assign(this, validatedData);
  }

  update(updateData) {
    const validatedData = ProjectSchema.partial().parse(updateData);
    Object.assign(this, validatedData, { updatedAt: new Date() });
    return this;
  }

  addDeliverable(deliverableData) {
    this.deliverables.push({
      ...deliverableData,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.updatedAt = new Date();
    return this;
  }
}