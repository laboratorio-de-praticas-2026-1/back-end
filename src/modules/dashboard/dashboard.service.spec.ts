import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { Solicitacao } from '../../models/solicitacao.model';
import { DocumentoSolicitacao } from '../../models/documento-solicitacao.model';
import { Debito } from '../../models/debito.model';
import { Pagamento } from '../../models/pagamento.model';
import { Parcela } from '../../models/parcela.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { Servico } from '../../models/servico.model';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { DebitoVeiculo } from '../../models/debito-veiculo.model';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Solicitacao), useValue: mockModel },
        { provide: getModelToken(DocumentoSolicitacao), useValue: mockModel },
        { provide: getModelToken(Servico), useValue: mockModel },
        { provide: getModelToken(DebitoServico), useValue: mockModel },
        { provide: getModelToken(Debito), useValue: mockModel },
        { provide: getModelToken(Pagamento), useValue: mockModel },
        { provide: getModelToken(Parcela), useValue: mockModel },
        { provide: getModelToken(Usuario), useValue: mockModel },
        { provide: getModelToken(Veiculo), useValue: {} },
        { provide: getModelToken(DebitoVeiculo), useValue: {} },
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
