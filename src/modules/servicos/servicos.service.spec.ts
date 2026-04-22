/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ServicosService } from './servicos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateServicoDto } from './dto/servico-create.dto';
import { UpdateServicoDto } from './dto/servico-update.dto';

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
      const mockServicoBase = {
        id: 1,
        nome: 'Original',
        descricao: 'Descricao Antiga',
        valorBase: 100,
      };

      const mockServico = {
        ...mockServicoBase,
        update: jest.fn().mockImplementation((servicoDto: UpdateServicoDto) => {
          mockServico.nome = servicoDto.nome ?? mockServico.nome;
          mockServico.descricao = servicoDto.descricao ?? mockServico.descricao;
          return Promise.resolve();
        }),
        reload: jest.fn().mockResolvedValue(undefined),
      } as unknown as Servico;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico);

      const dto: UpdateServicoDto = {
        nome: 'exemplo',
        descricao: 'exemplo',
      };

      const resultado = await service.updateServico(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);

      expect(mockServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'exemplo',
          descricao: 'exemplo',
        }),
      );

      expect(mockServico.reload).toHaveBeenCalled();
      expect(resultado).toEqual(mockServico);
    });
    it('deve manter os valores originais quando o DTO está vazio', async () => {
      const mockServicoOriginal = {
        id: 1,
        nome: 'Original',
        descricao: 'Descricao Antiga',
        valorBase: 100,
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(undefined),
      } as unknown as Servico;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServicoOriginal);

      const dtoVazio: UpdateServicoDto = {};

      await service.updateServico(1, dtoVazio);

      expect(mockServicoOriginal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Original',
          descricao: 'Descricao Antiga',
          valorBase: 100,
        }),
      );
    });
  });

  describe('deleteServico', () => {
    it('deve deletar um serviço com sucesso', async () => {
      const mockServico = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      } as unknown as Servico;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico);

      await service.deleteServico(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockServico.destroy).toHaveBeenCalled();
    });

    it('deve lançar erro se tentar deletar um serviço inexistente', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.deleteServico(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createServico', () => {
    it('deve criar um serviço com sucesso recebendo um objeto', async () => {
      const dto: CreateServicoDto = {
        nome: 'Troca de óleo',
        descricao: 'Troca completa do óleo do motor',
        valorBase: 120.5,
        prazoEstimadoDias: 2,
        ativo: true,
        exigeVeiculo: true,
      };
      const mockResult = {
        id: 1,
        nome: dto.nome,
        descricao: dto.descricao,
        valorBase: dto.valorBase,
        prazoEstimadoDias: dto.prazoEstimadoDias,
        ativo: dto.ativo,
        exigeVeiculo: dto.exigeVeiculo,
      };
      mockServicoModel.create.mockResolvedValue(mockResult);
      const result = await service.createServico(dto);

      expect(result).toEqual(mockResult);
      expect(mockServicoModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: dto.nome,
        descricao: dto.descricao,
        valorBase: dto.valorBase,
        prazoEstimadoDias: dto.prazoEstimadoDias,
        ativo: dto.ativo,
        exigeVeiculo: dto.exigeVeiculo,
      }),
    );
    });

    it('deve lançar BadRequestException se campos obrigatórios faltarem', async () => {
      const semNome = {
        valorBase: 100,
        prazoEstimadoDias: 2,
      } as unknown as CreateServicoDto;
      await expect(service.createServico(semNome)).rejects.toThrow(
        BadRequestException,
      );

      const semValor = {
        nome: 'Troca de Óleo',
        prazoEstimadoDias: 2,
      } as unknown as CreateServicoDto;
      await expect(service.createServico(semValor)).rejects.toThrow(
        BadRequestException,
      );

      const semPrazo = {
        nome: 'Troca de Óleo',
        valorBase: 100,
      } as unknown as CreateServicoDto;
      await expect(service.createServico(semPrazo)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve usar valores padrão no createServico', async () => {
      const dtoMinimo = {
        nome: 'Teste',
        valorBase: 50,
        prazoEstimadoDias: 1,
      };

      await service.createServico(dtoMinimo as CreateServicoDto);

      expect(mockServicoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dtoMinimo.nome,
          valorBase: dtoMinimo.valorBase,
          prazoEstimadoDias: dtoMinimo.prazoEstimadoDias,
          ativo: true,
          exigeVeiculo: false,
        }),
      );
    });
  });
});
