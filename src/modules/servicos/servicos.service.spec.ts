/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ServicosService } from './servicos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ServicosService', () => {
  let service: ServicosService;

  const mockServicoModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicosService,
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel,
        },
      ],
    }).compile();

    service = module.get<ServicosService>(ServicosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar a lista de serviços', async () => {
      const mockList = [
        { id: 1, nome: 'Troca de óleo', descricao: 'Serviço de troca de óleo' },
        { id: 2, nome: 'Alinhamento', descricao: 'Serviço de alinhamento' },
      ];
      mockServicoModel.findAll.mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(result).toEqual(mockList);
      expect(mockServicoModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o serviço quando encontrado', async () => {
      const mockServico = {
        id: 1,
        nome: 'Troca de óleo',
        descricao: 'Serviço de troca de óleo',
      };
      mockServicoModel.findByPk.mockResolvedValue(mockServico);

      const result = await service.findOne(1);

      expect(result).toEqual(mockServico);
      expect(mockServicoModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException quando serviço não encontrado', async () => {
      mockServicoModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      expect(mockServicoModel.findByPk).toHaveBeenCalledWith(99);
    });
  });

  describe('updateServico', () => {
    it('deve atualizar um serviço com sucesso', async () => {
      const mockServico = {
        id: 1,
        nome: 'Original',
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue({ id: 1, nome: 'Atualizado' }),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico as any);

      const dadosParaAtualizar = { nome: 'Atualizado' };
      const resultado = await service.updateServico(1, dadosParaAtualizar);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockServico.update).toHaveBeenCalled();
      expect(mockServico.reload).toHaveBeenCalled();
      expect(resultado.nome).toBe('Atualizado');
    });
  });

  describe('deleteServico', () => {
    it('deve deletar um serviço com sucesso', async () => {
      const mockServico = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico as any);

      await service.deleteServico(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockServico.destroy).toHaveBeenCalled();
    });

    it('deve lançar erro se tentar deletar um serviço inexistente', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.deleteServico(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createServico', () => {
    it('deve criar um serviço com sucesso recebendo um objeto', async () => {
      const mockServico = {
        nome: 'Troca de óleo',
        descricao: 'Troca completa do óleo do motor',
        valorBase: 120.5,
        prazoEstimadoDias: 2,
        ativo: true,
      };
      const mockResult = { id: 1, ...mockServico };

      mockServicoModel.create.mockResolvedValue(mockResult);

      const result = await service.createServico(mockServico);

      expect(result).toEqual(mockResult);
      expect(mockServicoModel.create).toHaveBeenCalledWith(mockServico);
      expect(result.valorBase).toBe(120.5);
    });

    it('deve lançar BadRequestException se o nome não for enviado no objeto', async () => {
      const incompleteDto = { descricao: 'Sem nome' };

      await expect(service.createServico(incompleteDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});