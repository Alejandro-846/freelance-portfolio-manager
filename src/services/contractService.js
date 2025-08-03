import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ContractRepository } from '../repositories/contractRepository.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { withTransaction } from '../config/database.js';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ContractService {
  constructor() {
    this.contractRepo = new ContractRepository();
    this.clientRepo = new ClientRepository();
    this.projectRepo = new ProjectRepository();
    this.contractsDir = path.join(__dirname, '../../contracts');
    this.#ensureContractsDirExists();
  }

  #ensureContractsDirExists() {
    if (!fs.existsSync(this.contractsDir)) {
      fs.mkdirSync(this.contractsDir, { recursive: true });
      console.log(chalk.gray(`Directorio de contratos creado en: ${this.contractsDir}`));
    }
  }

  async createContract(contractData, session = null) {
    return withTransaction(async (txSession) => {
      // Validaciones
      const client = await this.clientRepo.findById(contractData.clientId, txSession);
      if (!client) throw new Error('Cliente no encontrado');

      if (contractData.projectId) {
        const project = await this.projectRepo.findById(contractData.projectId, txSession);
        if (!project) throw new Error('Proyecto no encontrado');
      }

      // Crear contrato
      const contract = new Contract(contractData);
      const createdContract = await this.contractRepo.create(contract, txSession);

      // Generar PDF
      const pdfPath = await this.#generateContractPDF(createdContract, client);
      
      // Actualizar con ruta del PDF
      return this.contractRepo.update(
        createdContract._id, 
        { pdfPath, status: 'SENT' },
        txSession
      );
    }, session);
  }

  async #generateContractPDF(contract, client) {
    const pdfPath = path.join(this.contractsDir, `contract_${contract._id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    // Configuración del documento
    doc.pipe(fs.createWriteStream(pdfPath));

    // Encabezado
    doc.fontSize(20).text(`CONTRATO: ${contract.title}`, { align: 'center' });
    doc.moveDown();

    // Información de las partes
    doc.fontSize(12).text(`Entre las partes:`);
    doc.text(`- Prestador: [TU NOMBRE/EMPRESA]`);
    doc.text(`- Cliente: ${client.name} (${client.email})`);
    doc.moveDown();

    // Términos y condiciones
    doc.fontSize(14).text('Términos y Condiciones:', { underline: true });
    contract.terms.forEach((term, i) => {
      doc.fontSize(12).text(`${i + 1}. ${term}`, { indent: 20 });
    });
    doc.moveDown();

    // Información financiera
    doc.fontSize(14).text('Acuerdo Financiero:', { underline: true });
    doc.text(`Valor total: $${contract.value}`);
    doc.text(`Condiciones de pago: ${contract.paymentTerms}`);
    doc.moveDown();

    // Fechas y firmas
    doc.text(`Fecha inicio: ${contract.startDate.toLocaleDateString()}`);
    doc.text(`Fecha fin: ${contract.endDate.toLocaleDateString()}`);
    doc.moveDown(3);
    doc.text('Firma del Cliente: ________________________');
    doc.text('Fecha: ______________');

    doc.end();

    return pdfPath;
  }

  async signContract(contractId, signerName, session = null) {
    return withTransaction(async (txSession) => {
      const contract = await this.contractRepo.findById(contractId, txSession);
      if (!contract) throw new Error('Contrato no encontrado');
      if (contract.status !== 'SENT') throw new Error('Solo se pueden firmar contratos enviados');

      return this.contractRepo.update(
        contractId,
        {
          status: 'SIGNED',
          signedAt: new Date(),
          signedBy: signerName,
          updatedAt: new Date()
        },
        txSession
      );
    }, session);
  }
}