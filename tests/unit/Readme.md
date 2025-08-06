Posibles Ejercicios para el Examen Relacionados al Proyecto
Basado en tu proyecto freelance-portfolio-manager, estos son los tipos de ejercicios que podrían aparecer en tu examen, junto con ejercicios de práctica:

🔍 Ejercicios Teóricos Probables
1. Preguntas sobre Arquitectura
Ejemplo:
"Explique cómo aplicó el principio de Responsabilidad Única (SOLID) en el ClientService.js de su proyecto"

Respuesta esperada:

markdown
El ClientService.js sigue el SRP al:
- Tener solo una razón para cambiar: la lógica de negocio de clientes
- Delegar el acceso a datos al ClientRepository
- Encapsular las reglas de validación
2. Patrones de Diseño
Ejercicio práctico:
"Identifique 2 patrones en este fragmento de código (proporcionarían un snippet) y explique su implementación en su proyecto"

Posibles patrones en tu proyecto:

Repository (en *Repository.js)

Command (en *Commands.js)

Factory (creación de proyectos)

💻 Ejercicios Prácticos Probables
1. Implementar un Endpoint/Método
Enunciado típico:
"Complete la función updateProjectStatus para que maneje transacciones y validaciones:"

javascript
// Ejercicio a completar
async function updateProjectStatus(projectId, newStatus) {
  // Validar que newStatus sea: ['ACTIVE', 'PAUSED', 'COMPLETED']
  // Implementar con transacción
  // Registrar fecha de cambio
}
2. Debugging de Transacciones
Caso propuesto:
"Este código tiene un error en el manejo de transacciones, identifíquelo y corríjalo:"

javascript
async function createProjectWithDeliverables() {
  const session = client.startSession();
  try {
    session.startTransaction();
    const project = await projects.insertOne({...}, { session });
    await deliverables.insertOne({...}); // Falta session
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
  }
}
📝 Preguntas sobre MongoDB
1. Consultas Avanzadas
Ejercicio:
"Escriba una consulta MongoDB para encontrar todos los proyectos activos con entregables vencidos:"

Solución esperada:

javascript
db.projects.aggregate([
  {
    $match: { 
      status: "ACTIVE",
      "deliverables.deadline": { $lt: new Date() }
    }
  }
])
2. Transacciones
Pregunta:
"Explique cuándo usaría transacciones en su proyecto y muestre un ejemplo real de su código"

Respuesta clave:

markdown
Uso transacciones en:
1. Creación de proyecto + entregables (operaciones atómicas)
2. Actualización de estados con rollback

Ejemplo en ProposalService.js:
await withTransaction(async (session) => {
  await acceptProposal(id, session);
  await createProjectFromProposal(id, session);
});
🛠 Ejercicios de Validación
1. Schema Validation
Tarea:
"Extienda el schema de Client.js para validar que el email sea único y el teléfono tenga formato internacional:"

javascript
// Solución
export const ClientSchema = z.object({
  email: z.string().email().refine(async email => {
    return !await clientRepo.emailExists(email);
  }, { message: "Email ya registrado" }),
  phone: z.string().regex(/^\+\d{10,15}$/)
});
🔗 Integración de Módulos
1. Composición de Servicios
Problema:
"¿Cómo haría para que el FinancialService notifique al ClientService cuando se registre un pago?"

Patrón aplicable:

javascript
// Usando Observer
class FinancialService {
  constructor() {
    this.observers = [];
  }

  registerPayment(amount) {
    notifyObservers({ type: 'PAYMENT', amount });
  }
}
📊 Ejercicios de Análisis
1. Rendimiento
Pregunta:
"¿Cómo optimizaría la consulta de proyectos por cliente si tuviera 100,000 registros?"

Respuestas esperadas:

Índices en campo clientId

Paginación con skip() y limit()

Proyección de campos

🧪 Casos de Prueba
1. Testing
Ejercicio:
"Escriba un test unitario para verifyClientExists en ClientService.js"

Estructura esperada:

javascript
describe('verifyClientExists', () => {
  it('debe lanzar error si cliente no existe', async () => {
    await expect(service.verifyClientExists('fake-id'))
      .rejects.toThrow('Cliente no encontrado');
  });
});
📌 Consejos para el Examen
Repasa estos conceptos clave:

Relaciones entre colecciones en MongoDB

Manejo de errores en transacciones

Validación con Zod

Inyección de dependencias

Prepara ejemplos de:

Un caso donde usaste Repository pattern

Una validación compleja que implementaste

Cómo manejas errores en operaciones atómicas

Practica con:

bash
# Ejercicio rápido: Implementa esta función
async function cancelProject(projectId) {
  // Debe:
  // 1. Cambiar estado a "CANCELLED"
  // 2. Revertir entregables asociados
  // 3. Usar transacción
}
¿Te gustaría que profundicemos en algún área específica o que genere más ejercicios prácticos de algún módulo en particular?

dame otro ejercicio
Aquí tienes un ejercicio completo tipo examen basado en tu proyecto, con solución detallada:

🎯 Ejercicio Práctico: Implementación de Rollback en Entregables
Enunciado:

markdown
1. Complete la función `rejectDeliverable` en `DeliverableService.js` que debe:
   - Cambiar el estado a "REJECTED"
   - Registrar feedback
   - Guardar el estado anterior para posible rollback
   - Usar transacción
   - Notificar al cliente por email (simular)

2. Implemente el método `restoreState` que revertirá los cambios si la transacción falla

3. Escriba un test unitario básico
Solución Paso a Paso
En src/services/DeliverableService.js:

javascript
async rejectDeliverable(deliverableId, feedback = '', session = null) {
  return withTransaction(async (txSession) => {
    // 1. Obtener estado actual
    const deliverable = await this.deliverableRepo.findById(deliverableId, txSession);
    if (!deliverable) throw new Error('Entregable no encontrado');

    // 2. Guardar estado anterior (para rollback)
    const previousState = {
      status: deliverable.status,
      feedback: deliverable.feedback
    };

    // 3. Actualizar estado
    await this.deliverableRepo.updateStatus(
      deliverableId,
      'REJECTED',
      feedback,
      txSession
    );

    // 4. Configurar rollback automático
    txSession.onError(async () => {
      console.log('Ejecutando rollback...');
      await this.restoreState(deliverableId, previousState);
    });

    // 5. Simular notificación
    await this.notifyClient(deliverable.projectId, 'ENTREGABLE_RECHAZADO');

    return { success: true, previousState };
  }, session);
}

async restoreState(deliverableId, previousState) {
  const collection = await this.deliverableRepo.getCollection();
  await collection.updateOne(
    { _id: new ObjectId(deliverableId) },
    { $set: previousState }
  );
}
Test Unitario (en tests/DeliverableService.test.js):

javascript
import { DeliverableService } from '../src/services/DeliverableService.js';
import { MongoClient } from 'mongodb';

describe('rejectDeliverable', () => {
  let client, db, service;

  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    db = client.db('test_db');
    service = new DeliverableService(db);
  });

  it('debe hacer rollback si falla la notificación', async () => {
    // 1. Insertar datos de prueba
    const deliverable = await db.collection('deliverables').insertOne({
      status: 'PENDING',
      feedback: ''
    });

    // 2. Mock de función que fallará
    service.notifyClient = jest.fn()
      .mockRejectedValue(new Error('Error de email'));

    // 3. Ejecutar rechazo (debe fallar)
    await expect(service.rejectDeliverable(deliverable.insertedId, 'Mal formato'))
      .rejects.toThrow();

    // 4. Verificar rollback
    const updated = await db.collection('deliverables').findOne({
      _id: deliverable.insertedId
    });
    expect(updated.status).toBe('PENDING'); // Estado original
  });
});
Conceptos Clave Evaluados:
Manejo de transacciones: Uso correcto de withTransaction

Patrón Observer: Notificación al cliente

Rollback manual: Restauración de estado anterior

Validación: Verificación de existencia del entregable

Testing: Simulación de errores

Variante Más Compleja (Bonus):
javascript
// Ejercicio adicional: Implementar "rechazo en cascada"
async function rejectWithCascade(deliverableId) {
  // Si se rechaza un entregable principal:
  // 1. Rechazar sus sub-entregables
  // 2. Notificar a todos los stakeholders
  // 3. Registrar auditoría
}
¿Quieres que genere más ejercicios sobre algún área específica (transacciones, validaciones, patrones de diseño)? Puedo proporcionarte:

Un ejercicio avanzado de transacciones anidadas

Un caso de validación compleja con Zod

Un problema de optimización de consultas MongoDB




Ejercicio Práctico: Middleware de Validación para Entregables
Enunciado:
Implementa un middleware en Node.js que valide los entregables antes de ser creados, verificando:

Que el proyecto asociado exista y esté activo

Que la fecha límite sea futura

Que el nombre no exceda 100 caracteres

javascript
// 1. Crea el archivo src/middlewares/deliverableValidator.js
import { Deliverable } from '../models/Deliverable.js';
import { ProjectRepository } from '../repositories/projectRepository.js';

export const deliverableValidator = async (req, res, next) => {
    try {
        const { projectId, name, deadline } = req.body;
        
        // Validación 1: Nombre
        if (name.length > 100) {
            throw new Error('El nombre no puede exceder 100 caracteres');
        }

        // Validación 2: Fecha futura
        if (new Date(deadline) <= new Date()) {
            throw new Error('La fecha límite debe ser futura');
        }

        // Validación 3: Proyecto existente y activo
        const projectRepo = new ProjectRepository();
        const project = await projectRepo.findById(projectId);
        
        if (!project || project.status !== 'ACTIVE') {
            throw new Error('El proyecto no existe o no está activo');
        }

        // Validación Zod del schema completo
        new Deliverable(req.body); // Lanzará error si no cumple schema
        
        next(); // Pasa al controller si todo es válido
    } catch (error) {
        res.status(400).json({ 
            error: 'Error de validación',
            details: error.message 
        });
    }
};
📝 Cómo usarlo en tu API (si la tuvieras):
javascript
import { deliverableValidator } from './middlewares/deliverableValidator.js';

router.post('/deliverables', 
    deliverableValidator, // Middleware de validación
    deliverableController.createDeliverable // Controller
);
🔍 Preguntas teóricas relacionadas (que podrían preguntar):
¿Por qué es importante separar la validación en un middleware?

Respuesta: Para mantener el principio SRP (Single Responsibility), permitir reutilización y hacer el código más mantenible.

¿Cómo manejarías errores asíncronos en este middleware?

Solución: Con un wrapper async/errorHandler:

javascript
const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

export const deliverableValidator = asyncHandler(async (req, res, next) => {
    // ... lógica de validación
});
💻 Ejercicio Adicional: Test Unitario
Implementa un test para este middleware usando Jest:

javascript
// tests/deliverableValidator.test.js
import { deliverableValidator } from '../src/middlewares/deliverableValidator.js';
import { ProjectRepository } from '../src/repositories/projectRepository.js';

jest.mock('../src/repositories/projectRepository.js');

describe('deliverableValidator', () => {
    let mockRequest, mockResponse, nextFunction;
    
    beforeEach(() => {
        mockRequest = { body: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    test('debe rechazar fecha pasada', async () => {
        mockRequest.body = {
            projectId: 'validId',
            name: 'Test',
            deadline: '2020-01-01'
        };
        
        await deliverableValidator(mockRequest, mockResponse, nextFunction);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Error de validación',
                details: expect.stringContaining('fecha límite')
            })
        );
    });
});


🎯 Ejercicio: Sistema de Eventos para el Gestor de Proyectos
Enunciado:
Implementa un módulo EventEmitter personalizado para manejar eventos en tu aplicación:

javascript
// eventManager.js
class EventManager {
  constructor() {
    // 1. Implementa un mapa para almacenar los eventos y sus listeners
    this.events = new Map();
  }

  on(eventName, listener) {
    // 2. Registra un listener para un evento
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(listener);
  }

  emit(eventName, ...args) {
    // 3. Dispara todos los listeners de un evento
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(listener => {
        listener(...args);
      });
    }
  }

  off(eventName, listenerToRemove) {
    // 4. Elimina un listener específico de un evento
    if (this.events.has(eventName)) {
      const filteredListeners = this.events.get(eventName).filter(
        listener => listener !== listenerToRemove
      );
      this.events.set(eventName, filteredListeners);
    }
  }
}

// 5. Crea una instancia global (patrón Singleton)
const eventManager = new EventManager();
module.exports = eventManager;
Ejercicio Práctico:

Usa este EventManager para notificar cuando:

Un proyecto cambia de estado

Un entregable se aprueba/rechaza

Solución de aplicación:

javascript
// En ProjectService.js
const eventManager = require('./eventManager');

class ProjectService {
  async updateStatus(projectId, newStatus) {
    // ...lógica existente
    
    // Notificar el cambio
    eventManager.emit('projectStatusChanged', {
      projectId,
      oldStatus: previousStatus,
      newStatus
    });
  }
}

// En otro archivo (ej: notifications.js)
eventManager.on('projectStatusChanged', ({ projectId, newStatus }) => {
  console.log(`[Notificación] Proyecto ${projectId} cambió a ${newStatus}`);
});
Preguntas teóricas relacionadas:

¿Cómo evitarías memory leaks con este EventManager?

¿Qué modificarías para implementar un sistema de prioridad de eventos?

¿Cómo extenderías esto para manejar eventos asíncronos?

Conceptos evaluados:

Patrón Observer/EventEmitter

Manejo de colecciones (Map)

Modularización en Node.js

Patrón Singleton

¿Quieres que desarrollemos juntos alguna parte específica de este ejercicio o prefieres uno con diferente enfoque?

