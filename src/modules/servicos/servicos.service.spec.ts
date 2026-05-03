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

  const mockServico = {
    id: 1,
    nome: 'Teste',
    descricao: 'Teste',
    valorBase: 100,
    update: jest.fn(),
    reload: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de serviços', async () => {
      mockServicoModel.findAll.mockResolvedValue([mockServico]);

      const result = await service.findAll();

      expect(result).toEqual([mockServico]);
      expect(mockServicoModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar serviço', async () => {
      mockServicoModel.findByPk.mockResolvedValue(mockServico);

      const result = await service.findOne(1);

      expect(result).toEqual(mockServico);
      expect(mockServicoModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException', async () => {
      mockServicoModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createServico', () => {
    it('deve criar serviço com sucesso', async () => {
      const dto: CreateServicoDto = {
        nome: 'Troca de óleo',
        descricao: 'Teste',
        valor_base: 120,
        prazo_estimado_dias: 2,
        ativo: true,
        exige_veiculo: false,
      };

      const mockResult = { id: 1, ...dto };

      mockServicoModel.create.mockResolvedValue(mockResult);

      const result = await service.createServico(dto);

      expect(result).toEqual(mockResult);

      expect(mockServicoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dto.nome,
          descricao: dto.descricao,
          valorBase: dto.valor_base,
          prazoEstimadoDias: dto.prazo_estimado_dias,
          ativo: dto.ativo,
          exigeVeiculo: dto.exige_veiculo,
        }),
      );
    });

    it('deve lançar BadRequestException quando inválido', async () => {
      await expect(
        service.createServico({
          nome: '',
          valor_base: 100,
          prazo_estimado_dias: 1,
        } as CreateServicoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateServico', () => {
    it('deve atualizar serviço', async () => {
      mockServico.update.mockResolvedValue(undefined);
      mockServico.reload.mockResolvedValue(undefined);

      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico as any);

      const dto: UpdateServicoDto = {
        nome: 'Novo',
        descricao: 'Nova',
      };

      const result = await service.updateServico(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockServico.update).toHaveBeenCalled();
      expect(mockServico.reload).toHaveBeenCalled();
      expect(result).toBe(mockServico);
    });
  });

  describe('deleteServico', () => {
    it('deve deletar serviço', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockServico as any);

      await service.deleteServico(1);

      expect(mockServico.destroy).toHaveBeenCalled();
    });
  });
});