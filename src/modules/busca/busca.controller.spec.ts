import { Test, TestingModule } from '@nestjs/testing';
import { BuscaController } from './busca.controller';
import { BuscaService } from './busca.service';

describe('BuscaController', () => {
  let controller: BuscaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuscaController],
      providers: [
        {
          provide: BuscaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BuscaController>(BuscaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
