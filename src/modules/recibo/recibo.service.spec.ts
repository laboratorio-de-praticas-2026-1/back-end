import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Debito } from 'src/models/debito.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { ReciboService } from './recibo.service';

describe('ReciboService', () => {
  let service: ReciboService;
  let mockCloudinaryService: {
    uploadDocument: jest.Mock;
    generateTemporaryUrl: jest.Mock;
  };
  let mockCryptoUtil: {
    encrypt: jest.Mock;
    decrypt: jest.Mock;
  };
  let mockModel: {
    findByPk: jest.Mock;
  };

  beforeEach(async () => {
    mockModel = {
      findByPk: jest.fn(),
    };

    mockCloudinaryService = {
      uploadDocument: jest.fn(),
      generateTemporaryUrl: jest.fn().mockReturnValue('https://temp-url.com'),
    };

    mockCryptoUtil = {
      encrypt: jest.fn().mockReturnValue('encrypted-value'),
      decrypt: jest.fn().mockReturnValue('raw|fake-id'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReciboService,
        { provide: getModelToken(Servico), useValue: mockModel },
        { provide: getModelToken(Solicitacao), useValue: mockModel },
        { provide: getModelToken(Veiculo), useValue: mockModel },
        { provide: getModelToken(Usuario), useValue: mockModel },
        { provide: getModelToken(Pagamento), useValue: mockModel },
        { provide: getModelToken(Debito), useValue: mockModel },
        { provide: getModelToken(DebitoVeiculo), useValue: mockModel },
        { provide: getModelToken(DebitoServico), useValue: mockModel },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: CryptoUtil, useValue: mockCryptoUtil },
      ],
    }).compile();

    service = module.get<ReciboService>(ReciboService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve gerar um recibo e retornar a url temporária', async () => {
    const buildReciboHtmlSpy = jest
      .spyOn(service as any, 'buildReciboHtml')
      .mockResolvedValue('<html></html>');
    const renderHtmlToPdfSpy = jest
      .spyOn(service as any, 'renderHtmlToPdf')
      .mockResolvedValue(Buffer.from('pdf'));

    mockCloudinaryService.uploadDocument.mockResolvedValue({
      public_id: 'fake-id',
      resource_type: 'raw',
    });

    const resultado = await service.create({ idSolicitacao: 1 } as any);

    expect(buildReciboHtmlSpy).toHaveBeenCalledWith({ idSolicitacao: 1 });
    expect(renderHtmlToPdfSpy).toHaveBeenCalledWith('<html></html>');
    expect(mockCloudinaryService.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        mimetype: 'application/pdf',
        originalname: 'recibo_solicitacao_1.pdf',
        buffer: expect.any(Buffer),
      }),
    );
    expect(mockCryptoUtil.encrypt).toHaveBeenCalledWith('raw|fake-id');
    expect(mockCryptoUtil.decrypt).toHaveBeenCalledWith('encrypted-value');
    expect(mockCloudinaryService.generateTemporaryUrl).toHaveBeenCalledWith(
      'raw|fake-id',
    );
    expect(resultado).toEqual({ urlDownload: 'https://temp-url.com' });
  });

  it('deve gerar o buffer do pdf no previewDownload', async () => {
    jest.spyOn(service as any, 'buildReciboHtml').mockResolvedValue('<html></html>');
    const renderHtmlToPdfSpy = jest
      .spyOn(service as any, 'renderHtmlToPdf')
      .mockResolvedValue(Buffer.from('preview-pdf'));

    const resultado = await service.previewDownload({ idSolicitacao: 1 } as any);

    expect(renderHtmlToPdfSpy).toHaveBeenCalledWith('<html></html>');
    expect(resultado).toEqual(Buffer.from('preview-pdf'));
  });

  it('deve marcar o recibo como sem débito quando não houver pagamento relacionado', async () => {
    const mockRenderReciboTemplate = jest
      .spyOn(service as any, 'renderReciboTemplate')
      .mockReturnValue('html-gerado');

    jest.spyOn(service as any, 'getDataFromSolicitacaoId').mockResolvedValue({
      usuario: {
        nome: 'Cliente Teste',
        cpfCnpj: '123',
        email: 'cliente@teste.com',
        celular: '(11) 99999-0000',
        toJSON: () => ({
          nome: 'Cliente Teste',
          cpfCnpj: '123',
          email: 'cliente@teste.com',
          celular: '(11) 99999-0000',
        }),
      },
      veiculo: {
        placa: 'ABC1A23',
        renavam: '123456789',
        marca: 'Honda',
        modelo: 'Civic',
        anoFabricacao: 2020,
        anoModelo: 2021,
        toJSON: () => ({
          placa: 'ABC1A23',
          renavam: '123456789',
          marca: 'Honda',
          modelo: 'Civic',
          anoFabricacao: 2020,
          anoModelo: 2021,
        }),
      },
      servico: {
        nome: 'Licenciamento',
        toJSON: () => ({ nome: 'Licenciamento' }),
      },
      debito: undefined,
      dataConclusao: undefined,
    });

    await (service as any).buildReciboHtml({ idSolicitacao: 1 });

    expect(mockRenderReciboTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        temDebito: false,
        tipoPagamento: 'Método Não Informado',
        numeroParcelas: '',
        valorTaxas: '',
        valorPago: '',
      }),
    );
  });

  it('deve lançar exceção quando a solicitação não existir', async () => {
    jest.spyOn(service as any, 'getDataFromSolicitacaoId').mockRejectedValue(
      new InternalServerErrorException('Erro ao gerar recibo. Solicitação não encontrada.'),
    );

    await expect((service as any).buildReciboHtml({ idSolicitacao: 99 })).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
