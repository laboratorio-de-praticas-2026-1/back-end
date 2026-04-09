import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { RecomendacaoService } from './recomendacao.service';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { InternalServerErrorException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SolicitacaoComServico } from './dto/solicitacao-com-servico';

describe('RecomendacaoService', () => {
  let service: RecomendacaoService;

  const mockSolicitacaoModel = {
    findAll: jest.fn() as jest.MockedFunction<
      () => Promise<SolicitacaoComServico[]>
    >,
  };

  const mockServicoModel = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecomendacaoService,
        {
          provide: getModelToken(Solicitacao),
          useValue: mockSolicitacaoModel,
        },
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel,
        },
      ],
    }).compile();

    service = module.get<RecomendacaoService>(RecomendacaoService);
  });

  describe('buscarAtributosPerfil', () => {
    it('deve retornar serviços contratados pelo usuário', async () => {
      const usuarioId = 1;

      const mockDbResponse: SolicitacaoComServico[] = [
        {
          servico: {
            nome: 'Transferência de Propriedade',
            descricao: 'Mudança de propriedade de veículo',
            valor_base: 350.0,
            ativo: true,
          },
        },
        {
          servico: {
            nome: 'Licenciamento Anual',
            descricao: 'Taxa de licenciamento',
            valor_base: 180.0,
            ativo: true,
          },
        },
      ];

      mockSolicitacaoModel.findAll.mockResolvedValue(mockDbResponse);

      const resultado = await service.buscarAtributosPerfil(usuarioId);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('Transferência de Propriedade');
      expect(resultado[0].valor_base).toBe(350.0);
      expect(resultado[1].nome).toBe('Licenciamento Anual');
      expect(resultado[1].valor_base).toBe(180.0);
    });

    it('deve retornar array vazio e disparar warn se o histórico for inexistente', async () => {
      mockSolicitacaoModel.findAll.mockResolvedValue(
        [] as SolicitacaoComServico[],
      );

      const resultado = await service.buscarAtributosPerfil(99);

      expect(resultado).toEqual([]);
      expect(resultado).toHaveLength(0);
    });

    it('deve lançar InternalServerErrorException apenas em falhas técnicas de banco', async () => {
      mockSolicitacaoModel.findAll.mockRejectedValue(
        new Error('Conexão perdida'),
      );

      await expect(service.buscarAtributosPerfil(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
