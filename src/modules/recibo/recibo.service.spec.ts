import { Test, TestingModule } from '@nestjs/testing';
import { ReciboService } from './recibo.service';

describe('ReciboService', () => {
  let service: ReciboService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReciboService],
    }).compile();

    service = module.get<ReciboService>(ReciboService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
