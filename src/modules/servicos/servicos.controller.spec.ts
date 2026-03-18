import { Test, TestingModule } from '@nestjs/testing';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';

describe('ServicosController', () => {
  let controller: ServicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicosController],
      providers: [ServicosService],
    }).compile();

    controller = module.get<ServicosController>(ServicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
