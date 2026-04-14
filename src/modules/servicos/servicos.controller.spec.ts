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
    createServico: jest.fn(),
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

  describe('findAll', () => {
    it('deve retornar lista de serviços', async () => {
      const mockList = [
        { id: 1, nome: 'Troca de óleo', descricao: 'Serviço de troca de óleo' },
        { id: 2, nome: 'Alinhamento', descricao: 'Serviço de alinhamento' },
      ];
      mockServicosService.findAll.mockResolvedValue(mockList);

      await expect(controller.findAll()).resolves.toEqual(mockList);
      expect(mockServicosService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o serviço quando encontrado', async () => {
      const mockServico = {
        id: 1,
        nome: 'Troca de óleo',
        descricao: 'Serviço de troca de óleo',
      };
      mockServicosService.findOne.mockResolvedValue(mockServico);

      await expect(controller.findOne(1)).resolves.toEqual(mockServico);
      expect(mockServicosService.findOne).toHaveBeenCalledWith(1);
    });

    it('deve propagar NotFoundException quando serviço não encontrado', async () => {
      mockServicosService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateServico', () => {
    it('deve retornar o serviço atualizado', async () => {
      const id = 1;
      const dto = { nome: 'Novo Nome' };
      const mockResult = { id, ...dto };

      mockServicosService.updateServico = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await controller.updateServico(id, dto);

      expect(mockServicosService.updateServico).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteServico', () => {
    it('deve deletar um serviço com sucesso', async () => {
      const id = 1;

      // Configuramos o mock para apenas resolver (já que o delete retorna void/undefined)
      mockServicosService.deleteServico = jest
        .fn()
        .mockResolvedValue(undefined);

      await controller.deleteServico(id);

      expect(mockServicosService.deleteServico).toHaveBeenCalledWith(id);
    });

    it('deve propagar NotFoundException quando serviço não encontrado para deletar', async () => {
      mockServicosService.deleteServico = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(controller.deleteServico(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

   describe('createServico', () => {
    it('deve criar um serviço com sucesso e retornar os dados', async () => {
      const dto = {
        nome: 'Troca de óleo',
        descricao: 'Troca completa do óleo do motor',
        valorBase: 120.5,
        prazoEstimadoDias: 2,
        ativo: true,
      };
      const mockResult = { id: 1, ...dto };

      mockServicosService.createServico.mockResolvedValue(mockResult);

      const result = await controller.createServico(dto);

      expect(mockServicosService.createServico).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });
});
