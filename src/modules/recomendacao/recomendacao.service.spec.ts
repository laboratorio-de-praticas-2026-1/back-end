import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { RecomendacaoService } from './recomendacao.service';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { raw } from 'express';

describe('RecomendacaoService', () => {
  let service: RecomendacaoService;

  const mockServicoModel = {};

  const mockSolicitacaoModel = {
    findAll: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecomendacaoService,
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel
        },
        {
          provide: getModelToken(Solicitacao),
          useValue: mockSolicitacaoModel
        }
      ]
    }).compile();

    service = module.get<RecomendacaoService>(RecomendacaoService);
  });

  describe('buscarAtributosPerfil', () => {
    it('deve buscar os atributos de perfil do usuario com sucesso', async () => {
      const usuarioId = 1;
      
      const mockAtributos = [
        { nome: 'Serviço 1', descricao: 'Descrição 1', valor_base: 100, ativo: true },
        { nome: 'Serviço 2', descricao: 'Descrição 2', valor_base: 200, ativo: true }
      ];
      
      mockSolicitacaoModel.findAll.mockResolvedValue(mockAtributos);
      
      const atributos = await service.buscarAtributosPerfil(usuarioId);
      
      expect(atributos).toEqual(mockAtributos);

      expect(mockSolicitacaoModel.findAll).toHaveBeenCalledWith({
        attributes: [
          'servico.nome',
          'servico.descricao',
          'servico.valor_base',
          ['servico.ativo', 'ativo']
        ],
        where: {
          usuarioId: usuarioId,
        },
        include: [{
          model: mockServicoModel,
          attributes: []
        }],
        raw: true,
        nest: true
      });
    });

    it('deve lançar NotFoundException quando não encontrar atributos', async () => {
      const usuarioId = 999;
      
      mockSolicitacaoModel.findAll.mockResolvedValue([]);
      
      await expect(service.buscarAtributosPerfil(usuarioId)).rejects.toThrow(NotFoundException);
      
      expect(mockSolicitacaoModel.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve lançar InternalServerErrorException em caso de erro no banco', async () => {
      const usuarioId = 1;
      const erroBanco = new Error('Erro de conexão');
      
      mockSolicitacaoModel.findAll.mockRejectedValue(erroBanco);
      
      await expect(service.buscarAtributosPerfil(usuarioId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});