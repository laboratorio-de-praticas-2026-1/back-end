import { Test, TestingModule } from '@nestjs/testing';
import { ServicosService } from './servicos.service';

describe('ServicosService', () => {
  let service: ServicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicosService],
    }).compile();

    service = module.get<ServicosService>(ServicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
