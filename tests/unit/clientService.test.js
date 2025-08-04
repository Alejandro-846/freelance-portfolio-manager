const { ClientService } = require('../../src/services/clientService');
const { ClientRepository } = require('../../src/repositories/clientRepository');

jest.mock('../../src/repositories/clientRepository');

describe('ClientService', () => {
  test('Crear cliente con email duplicado falla', async () => {
    const mockRepo = new ClientRepository();
    mockRepo.findByEmail.mockResolvedValue({ email: "existente@test.com" });
    
    const service = new ClientService(mockRepo);
    await expect(service.createClient({ email: "existente@test.com" }))
      .rejects.toThrow("Email ya registrado");
  });
});