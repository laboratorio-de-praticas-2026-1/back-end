import { Test, TestingModule } from '@nestjs/testing';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';
import { NotFoundException } from '@nestjs/common';

describe('ServicosController', () => {
  let controller: ServicosController;

  const mockServicosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateServico: jest.fn(),
    deleteServico: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicosController],
      providers: [
        {
          provide: ServicosService,
          useValue: mockServicosService,
        },
      ],
    }).compile();

    controller = module.get<ServicosController>(ServicosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
