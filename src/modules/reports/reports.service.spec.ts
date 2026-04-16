import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { InternalServerErrorException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Relatorio } from 'src/models/relatorio.model';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CreateReportDto } from './dto/create-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockRelatorioModel: any;
  let mockCloudinaryService: any;
  let mockCryptoUtil: any;

  beforeEach(async () => {
    mockRelatorioModel = {
      create: jest.fn(),
    };

    mockCloudinaryService = {
      uploadDocument: jest.fn(),
      generateTemporaryUrl: jest.fn().mockReturnValue('https://temp-url.com'),
    };

    mockCryptoUtil = {
      encrypt: jest.fn().mockReturnValue('encrypted-value'),
      decrypt: jest.fn().mockReturnValue('decrypted-value'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getModelToken(Relatorio),
          useValue: mockRelatorioModel,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: CryptoUtil,
          useValue: mockCryptoUtil,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

      expect(mockRelatorioModel.create).toHaveBeenCalled();
      expect(resultado).toBeDefined();
      expect(resultado.nome).toBe(createReportDto.nome);
    });

    it('deve usar dataInicio padrão quando não fornecida', async () => {
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

      expect(mockRelatorioModel.create).toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
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

    it('deve encriptar a URL do documento', async () => {
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

      expect(mockCryptoUtil.encrypt).toHaveBeenCalled();
    });
  });
});
