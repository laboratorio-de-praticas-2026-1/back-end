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

  it('deve criar um novo serviço', () => {
    const resultado = service.criarServico(
      'Troca de óleo',
      'Troca completa do óleo do motor',
      120.5,
      2,
      true,
    );

    expect(resultado).toBeDefined();
    expect(resultado.nome).toBe('Troca de óleo');
    expect(resultado.valor_base).toBe(120.5);
  });
});
