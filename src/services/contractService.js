import PDFDocument from 'pdfkit';
import fs from 'fs';
import { ContractRepository } from '../repositories/contractRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { withTransaction } from '../config/database.js';

export class ContractService {
  constructor() {
    this.contractRepo = new ContractRepository();
    this.clientRepo = new ClientRepository();
    this.projectRepo = new ProjectRepository();
  }

  async generateContractPDF(contractId, outputPath) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new Error('Contrato no encontrado');

    const client = await this.clientRepo.findById(contract.clientId);
    const doc = new PDFDocument();

    // Configuración del PDF
    doc.pipe(fs.createWriteStream(outputPath));
    doc.fontSize(20).text(`Contrato: ${contract.title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${client.name}`);
    doc.text(`Fecha Inicio: ${contract.startDate.toLocaleDateString()}`);
    doc.text(`Fecha Fin: ${contract.endDate.toLocaleDateString()}`);
    doc.moveDown();

    // Contenido del contrato
    doc.fontSize(14).text('Términos y Condiciones:');
    contract.terms.forEach(term => {
      doc.fontSize(12).text(`- ${term}`);
    });

    doc.end();
    return outputPath;
  }

  async createContract(contractData, session = null) {
    return withTransaction(async (txSession) => {
      // Validar cliente
      const client = await this.clientRepo.findById(
        contractData.clientId, 
        txSession
      );
      if (!client) throw new Error('Cliente no encontrado');

      // Validar proyecto si existe
      if (contractData.projectId) {
        const project = await this.projectRepo.findById(
          contractData.projectId, 
          txSession
        );
        if (!project) throw new Error('Proyecto no encontrado');
      }

      const contract = await this.contractRepo.create(contractData, txSession);
      
      // Generar PDF inicial
      const pdfPath = `./contracts/contract_${contract._id}.pdf`;
      await this.generateContractPDF(contract._id, pdfPath);
      
      // Actualizar con URL del PDF
      return this.contractRepo.update(contract._id, { pdfUrl: pdfPath }, txSession);
    }, session);
  }
}