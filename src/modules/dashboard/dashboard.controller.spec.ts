import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/sequelize';
import { Solicitacao } from '../../models/solicitacao.model';
import { DocumentoSolicitacao } from '../../models/documento-solicitacao.model';
import { Debito } from '../../models/debito.model';
import { Pagamento } from '../../models/pagamento.model';
import { Parcela } from '../../models/parcela.model';

const mockModel = { findAll: jest.fn(), findOne: jest.fn(), count: jest.fn() };

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    retornarInfosDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        { provide: getModelToken(Solicitacao), useValue: mockModel },
        { provide: getModelToken(DocumentoSolicitacao), useValue: mockModel },
        { provide: getModelToken(Debito), useValue: mockModel },
        { provide: getModelToken(Pagamento), useValue: mockModel },
        { provide: getModelToken(Parcela), useValue: mockModel },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
