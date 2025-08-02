import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ProposalStatus = z.enum([
  'DRAFT', 
  'SENT', 
  'ACCEPTED', 
  'REJECTED',
  'ARCHIVED'
]);

export const ProposalSchema = z.object({
  clientId: z.instanceof(ObjectId),
  title: z.string()
    .min(10, "El título debe tener al menos 10 caracteres")
    .max(100, "El título no puede exceder 100 caracteres"),
  description: z.string()
    .min(50, "La descripción debe tener al menos 50 caracteres"),
  value: z.number()
    .positive("El valor debe ser positivo")
    .max(1000000, "El valor no puede exceder 1,000,000"),
  status: ProposalStatus.default('DRAFT'),
  deliveryDate: z.date()
    .min(new Date(), "La fecha de entrega no puede ser en el pasado"),
  projectId: z.instanceof(ObjectId).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export class Proposal {
  constructor(data) {
    const validatedData = ProposalSchema.parse({
      ...data,
      clientId: new ObjectId(data.clientId),
      deliveryDate: new Date(data.deliveryDate),
      ...(data.projectId && { projectId: new ObjectId(data.projectId) })
    });
    Object.assign(this, validatedData);
  }

  update(updateData) {
    const validatedData = ProposalSchema.partial().parse(updateData);
    Object.assign(this, validatedData, { updatedAt: new Date() });
    return this;
  }
}