import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ClientSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .transform(name => name.trim()),
  email: z.string()
    .email("Email inválido")
    .transform(email => email.toLowerCase()),
  phone: z.string()
    .regex(/^[0-9]{10,15}$/, "El teléfono debe tener entre 10 y 15 dígitos")
    .transform(phone => phone.replace(/\D/g, '')),
  company: z.string()
    .max(50, "El nombre de la empresa no puede exceder 50 caracteres")
    .optional()
    .transform(company => company?.trim()),
  projects: z.array(z.instanceof(ObjectId))
    .default([])
    .describe("IDs de proyectos asociados"),
  isActive: z.boolean()
    .default(true)
    .describe("Indica si el cliente está activo"),
  createdAt: z.date()
    .default(() => new Date()),
  updatedAt: z.date()
    .default(() => new Date())
});

export class Client {
  constructor(data) {
    const validatedData = ClientSchema.parse(data);
    Object.assign(this, validatedData);
  }

  update(updateData) {
    const validatedData = ClientSchema.partial().parse(updateData);
    Object.assign(this, validatedData, { updatedAt: new Date() });
    return this;
  }

  addProject(projectId) {
    if (!this.projects.some(id => id.equals(projectId))) {
      this.projects.push(ObjectId.createFromHexString(projectId));
      this.updatedAt = new Date();
    }
    return this;
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
    return this;
  }

  static fromDB(data) {
    return new Client({
      ...data,
      _id: data._id ? ObjectId.createFromHexString(data._id.toString()) : undefined
    });
  }
}