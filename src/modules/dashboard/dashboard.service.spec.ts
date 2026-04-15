import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { Debito } from 'src/models/debito.model';

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
