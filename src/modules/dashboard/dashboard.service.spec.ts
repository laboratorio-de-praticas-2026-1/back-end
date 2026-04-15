import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Servico } from 'src/models/servico.model';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Solicitacao),
          useValue: {},
        },
        {
          provide: getModelToken(Servico),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
