import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/sequelize';
import { Solicitacao } from '../../models/solicitacao.model';
import { DocumentoSolicitacao } from '../../models/documento-solicitacao.model';
import { Debito } from '../../models/debito.model';
import { Pagamento } from '../../models/pagamento.model';
import { Parcela } from '../../models/parcela.model';
import { Servico } from '../../models/servico.model';
import { DebitoServico } from '../../models/debito-servico.model';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { DebitoVeiculo } from '../../models/debito-veiculo.model';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

const mockModel = { findAll: jest.fn(), findOne: jest.fn(), count: jest.fn() };

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockGuard = {
  canActivate: jest.fn().mockReturnValue(true),
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
        { provide: getModelToken(Veiculo), useValue: {} },
        { provide: getModelToken(Servico), useValue: mockModel },
        { provide: getModelToken(DebitoServico), useValue: mockModel },
        { provide: getModelToken(Usuario), useValue: mockModel },
        { provide: getModelToken(DebitoVeiculo), useValue: {} },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockGuard)
    .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
