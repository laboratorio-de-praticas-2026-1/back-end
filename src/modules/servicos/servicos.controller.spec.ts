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

  it('deve retornar mensagem de sucesso', () => {
    const resposta = controller.criar({
      nome: 'Troca de óleo',
      descricao: 'Troca completa do óleo do motor',
      valor_base: 120.5,
      prazo_estimado_dias: 2,
      ativo: true,
    });

    expect(resposta).toEqual({
      message: 'Serviço criado com sucesso',
    });
  });
});
