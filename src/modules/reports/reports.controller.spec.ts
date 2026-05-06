/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { jest } from '@jest/globals';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { Relatorio } from 'src/models/relatorio.model';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

type MockRelatorioModel = { create: jest.Mock };
type MockCloudinaryService = { uploadDocument: jest.Mock; generateTemporaryUrl: jest.Mock };
type MockCryptoUtil = { encrypt: jest.Mock; decrypt: jest.Mock };
type MockPdfGeneratorService = { generate: jest.Mock };

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  let mockRelatorioModel: MockRelatorioModel;
  let mockCloudinaryService: MockCloudinaryService;
  let mockCryptoUtil: MockCryptoUtil;
  let mockPdfGeneratorService: MockPdfGeneratorService;

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    mockRelatorioModel = { create: jest.fn() };

    mockCloudinaryService = {
      uploadDocument: jest.fn(),
      generateTemporaryUrl: jest.fn().mockReturnValue('https://temp-url.com'),
    };

    mockCryptoUtil = {
      encrypt: jest.fn().mockReturnValue('encrypted-value'),
      decrypt: jest.fn().mockReturnValue('decrypted-value'),
    };

    mockPdfGeneratorService = {
      generate: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        { provide: getModelToken(Relatorio), useValue: mockRelatorioModel },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: CryptoUtil, useValue: mockCryptoUtil },
        { provide: PdfGeneratorService, useValue: mockPdfGeneratorService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateReport', () => {
    it('deve retornar um relatório quando chamado com um DTO válido', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Relatório de Teste',
        descricao: 'Descrição do relatório',
        categoria: 'financial' as unknown as any,
      };

      const mockResult = {
        id: 1,
        nome: createReportDto.nome,
        descricao: createReportDto.descricao,
        categoria: createReportDto.categoria,
        urlDocumento: 'https://temp-url.com',
        dataGeracao: new Date(),
      } as unknown as never;

      jest.spyOn(service, 'generateReport' as any).mockResolvedValue(mockResult);

      const resultado = await controller.generateReport(createReportDto);

      expect(resultado).toBeDefined();
      expect(resultado.nome).toBe(createReportDto.nome);
      expect((service.generateReport as any).mock.calls.length).toBeGreaterThan(0);
    });

    it('deve chamar service.generateReport com os parâmetros corretos', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Teste',
        categoria: 'financial' as unknown as any,
      };

      const mockResult = {
        id: 1,
        nome: createReportDto.nome,
        categoria: createReportDto.categoria,
        urlDocumento: 'https://temp-url.com',
        dataGeracao: new Date(),
      } as unknown as never;

      jest.spyOn(service, 'generateReport' as any).mockResolvedValue(mockResult);

      await controller.generateReport(createReportDto);

      expect((service.generateReport as any).mock.calls.length).toBeGreaterThan(0);
    });

    it('deve propagar exceções do serviço', async () => {
      const createReportDto: CreateReportDto = {
        nome: 'Teste',
        categoria: 'financial' as unknown as any,
      };

      jest
        .spyOn(service, 'generateReport' as any)
        .mockRejectedValue(new Error('Erro no serviço') as never);

      await expect(controller.generateReport(createReportDto)).rejects.toThrow(
        'Erro no serviço',
      );
    });
  });
});
