import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Debito } from 'src/models/debito.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        { provide: getModelToken(Solicitacao), useValue: {} },
        { provide: getModelToken(DocumentoSolicitacao), useValue: {} },
        { provide: getModelToken(Veiculo), useValue: {} },
        { provide: getModelToken(Debito), useValue: {} },
        { provide: getModelToken(DebitoVeiculo), useValue: {} },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
