import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Debito } from 'src/models/debito.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Solicitacao), useValue: {} },
        { provide: getModelToken(DocumentoSolicitacao), useValue: {} },
        { provide: getModelToken(Veiculo), useValue: {} },
        { provide: getModelToken(Debito), useValue: {} },
        { provide: getModelToken(DebitoVeiculo), useValue: {} },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
