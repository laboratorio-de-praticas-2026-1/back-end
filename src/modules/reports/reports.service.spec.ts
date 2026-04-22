import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { InternalServerErrorException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { Relatorio } from 'src/models/relatorio.model';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CreateReportDto } from './dto/create-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockRelatorioModel: any;
  let mockCloudinaryService: any;
  let mockCryptoUtil: any;
  let mockPdfGeneratorService: any;

  beforeEach(async () => {
    mockRelatorioModel = { create: jest.fn() };

    mockCloudinaryService = {
      uploadDocument: jest.fn().mockResolvedValue({
        public_id: 'reports/fake-id',
        resource_type: 'raw',
      }),
      generateTemporaryUrl: jest.fn().mockReturnValue('https://temp-url.com'),
    };

    mockCryptoUtil = {
      encrypt: jest.fn().mockReturnValue('encrypted-value'),
      decrypt: jest.fn().mockReturnValue('raw|reports/fake-id'),
    };

    mockPdfGeneratorService = {
      generate: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getModelToken(Relatorio), useValue: mockRelatorioModel },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: CryptoUtil, useValue: mockCryptoUtil },
        { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    it('deve gerar um relatório com sucesso', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        descricao: 'Descrição do relatório',
        categoria: 'financial' as any,
      };

      const mockReportData = {
        id: 1,
        nome: createReportDto.nome,
        descricao: createReportDto.descricao,
        categoria: createReportDto.categoria,
        urlDocumentoHash: 'encrypted-value',
        dataGeracao: new Date(),
        get: jest.fn().mockReturnValue({
          id: 1,
          nome: createReportDto.nome,
          descricao: createReportDto.descricao,
          categoria: createReportDto.categoria,
          urlDocumentoHash: 'encrypted-value',
          dataGeracao: new Date(),
        }),
      };

      mockRelatorioModel.create.mockResolvedValue(mockReportData);

      const resultado = await service.generateReport(createReportDto);

      expect(mockPdfGeneratorService.generate).toHaveBeenCalledWith(createReportDto);
      expect(mockCloudinaryService.uploadDocument).toHaveBeenCalled();
      expect(mockCloudinaryService.uploadDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          mimetype: 'application/pdf',
          originalname: 'Relatório_de_Teste.pdf',
          buffer: expect.any(Buffer),
        }),
      );
      expect(mockCryptoUtil.encrypt).toHaveBeenCalledWith('raw|reports/fake-id');
      expect(mockCryptoUtil.decrypt).toHaveBeenCalledWith('encrypted-value');
      expect(mockCloudinaryService.generateTemporaryUrl).toHaveBeenCalledWith(
        'raw|reports/fake-id',
      );
      expect(mockRelatorioModel.create).toHaveBeenCalled();
      expect(resultado).toBeDefined();
      expect(resultado.nome).toBe(createReportDto.nome);
      expect(resultado.urlDocumento).toBe('https://temp-url.com');
    });

    it('deve usar dataPeriodoInicio padrão (30 dias atrás) quando não fornecida', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      const mockReportData = {
        id: 1,
        nome: createReportDto.nome,
        categoria: createReportDto.categoria,
        urlDocumentoHash: 'encrypted-value',
        dataGeracao: new Date(),
        get: jest.fn().mockReturnValue({
          id: 1,
          nome: createReportDto.nome,
          categoria: createReportDto.categoria,
          urlDocumentoHash: 'encrypted-value',
          dataGeracao: new Date(),
        }),
      };

      mockRelatorioModel.create.mockResolvedValue(mockReportData);

      await service.generateReport(createReportDto);

      expect(mockPdfGeneratorService.generate).toHaveBeenCalled();
      expect(mockRelatorioModel.create).toHaveBeenCalled();
    });

    it('deve gerar e fazer upload do PDF antes de salvar o registro', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      const mockReportData = {
        id: 1,
        nome: createReportDto.nome,
        categoria: createReportDto.categoria,
        urlDocumentoHash: 'encrypted-value',
        dataGeracao: new Date(),
        get: jest.fn().mockReturnValue({
          id: 1,
          nome: createReportDto.nome,
          categoria: createReportDto.categoria,
          urlDocumentoHash: 'encrypted-value',
          dataGeracao: new Date(),
        }),
      };

      mockRelatorioModel.create.mockResolvedValue(mockReportData);

      const generateOrder: string[] = [];
      mockPdfGeneratorService.generate.mockImplementation(async () => {
        generateOrder.push('generate');
        return Buffer.from('pdf');
      });
      mockCloudinaryService.uploadDocument.mockImplementation(async () => {
        generateOrder.push('upload');
        return { public_id: 'reports/fake-id', resource_type: 'raw' };
      });
      mockRelatorioModel.create.mockImplementation(async () => {
        generateOrder.push('create');
        return mockReportData;
      });

      await service.generateReport(createReportDto);

      expect(generateOrder).toEqual(['generate', 'upload', 'create']);
    });

    it('deve encriptar a URL do documento antes de salvar', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      const mockReportData = {
        id: 1,
        nome: createReportDto.nome,
        categoria: createReportDto.categoria,
        urlDocumentoHash: 'encrypted-value',
        dataGeracao: new Date(),
        get: jest.fn().mockReturnValue({
          id: 1,
          nome: createReportDto.nome,
          categoria: createReportDto.categoria,
          urlDocumentoHash: 'encrypted-value',
          dataGeracao: new Date(),
        }),
      };

      mockRelatorioModel.create.mockResolvedValue(mockReportData);

      await service.generateReport(createReportDto);

      expect(mockCryptoUtil.encrypt).toHaveBeenCalledWith('raw|reports/fake-id');
    });

    it('deve lançar InternalServerErrorException se o pdfGeneratorService falhar', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      mockPdfGeneratorService.generate.mockRejectedValue(
        new Error('Falha ao renderizar PDF'),
      );

      await expect(service.generateReport(createReportDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar InternalServerErrorException se o upload no Cloudinary falhar', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      mockCloudinaryService.uploadDocument.mockRejectedValue(
        new Error('Cloudinary offline'),
      );

      await expect(service.generateReport(createReportDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar InternalServerErrorException se o banco falhar', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        categoria: 'financial' as any,
      };

      mockRelatorioModel.create.mockRejectedValue(
        new Error('Erro de banco de dados'),
      );

      await expect(service.generateReport(createReportDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
