import { Test, TestingModule } from '@nestjs/testing';
import { ReciboController } from './recibo.controller';
import { ReciboService } from './recibo.service';

describe('ReciboController', () => {
  let controller: ReciboController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReciboController],
      providers: [ReciboService],
    }).compile();

    controller = module.get<ReciboController>(ReciboController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
