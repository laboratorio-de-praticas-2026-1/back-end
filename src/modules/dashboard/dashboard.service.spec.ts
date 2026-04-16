import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/sequelize';
import { Solicitacao } from '../../models/solicitacao.model';
import { DocumentoSolicitacao } from '../../models/documento-solicitacao.model';
import { Debito } from '../../models/debito.model';
import { Pagamento } from '../../models/pagamento.model';
import { Parcela } from '../../models/parcela.model';
const mockModel = { findAll: jest.fn(), findOne: jest.fn(), count: jest.fn() };
import { DebitoServico } from 'src/models/debito-servico.model';
import { Servico } from '../../models/servico.model';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockSolicitacaoModel = {
    count: jest.fn(),
    findAll: jest.fn(),
  };

  const mockDocumentoSolicitacaoModel = {
    count: jest.fn(),
  };

  const mockServicoModel = {
    count: jest.fn(),
  };

  const mockDebitoServicoModel = {
    findAll: jest.fn(),
  };

  const mockDebitoModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Solicitacao),
          useValue: mockSolicitacaoModel,
        },
        {
          provide: getModelToken(DocumentoSolicitacao),
          useValue: mockDocumentoSolicitacaoModel,
        },
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel,
        },
        {
          provide: getModelToken(DebitoServico),
          useValue: mockDebitoServicoModel,
        },
        {
          provide: getModelToken(Debito),
          useValue: mockDebitoModel,
        },
      ],
      providers: [
        DashboardService,
        { provide: getModelToken(Solicitacao), useValue: mockModel },
        { provide: getModelToken(DocumentoSolicitacao), useValue: mockModel },
        { provide: getModelToken(Debito), useValue: mockModel },
        { provide: getModelToken(Pagamento), useValue: mockModel },
        { provide: getModelToken(Parcela), useValue: mockModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
