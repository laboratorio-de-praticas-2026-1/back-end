import { Test, TestingModule } from '@nestjs/testing';
import { ServicosService } from './servicos.service';

describe('ServicosService', () => {
  let service: ServicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicosService], // Como você usa array, não precisa do Mock do Sequelize aqui
    }).compile();

    service = module.get<ServicosService>(ServicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um novo serviço com ID autoincrementado', () => {
    const resultado = service.criarServico(
      'Troca de óleo',
      'Troca completa do óleo do motor',
      120.5,
      2,
      true,
    );

    // Verifica se o objeto retornado tem as propriedades certas
    expect(resultado).toMatchObject({
      nome: 'Troca de óleo',
      descricao: 'Troca completa do óleo do motor',
      valor_base: 120.5,
      prazo_estimado_dias: 2,
      ativo: true,
    });

    // Verifica se o ID foi gerado corretamente
    expect(resultado.id).toBeDefined();
    expect(typeof resultado.id).toBe('number');
  });
});
