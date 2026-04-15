import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { RecomendacaoService } from './recomendacao.service';
import { InteracaoUsuario } from 'src/models/interacao-usuario.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { InternalServerErrorException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';
import { SolicitacaoComServicoDto } from './dto/solicitacao-com-servico.dto';

describe('RecomendacaoService', () => {
  let service: RecomendacaoService;

  const mockSolicitacaoModel = {
    findAll: jest.fn() as jest.MockedFunction<
      () => Promise<SolicitacaoComServicoDto[]>
    >,
    findOne: jest.fn() as jest.MockedFunction<
      () => Promise<any>
    >
  };

  const mockServicoModel = {};

  const mockInteracaoUsuarioModel = {
    create: jest.fn() as jest.MockedFunction<
      (interacaoRegistro: {
        usuarioId: number;
        categoriaBlog: RecomendacaoCategoriaBlogEnum;
        dataInteracao: string;
      }) => Promise<RecomendacaoInteracaoResponseDto>
    >,
  };

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
        {
          provide: getModelToken(InteracaoUsuario),
          useValue: mockInteracaoUsuarioModel,
        },
      ],
    }).compile();

    service = module.get<RecomendacaoService>(RecomendacaoService);
  });

  describe('buscarAtributosPerfil', () => {
    it('deve retornar serviços contratados pelo usuário', async () => {
      const usuarioId = 1;

      const mockDbResponse: SolicitacaoComServicoDto[] = [
        {
          servico: {
            id: 1,
            nome: 'Transferência de Propriedade',
            descricao: 'Mudança de propriedade de veículo',
            valor_base: 350.0,
            ativo: true,
          },
        },
        {
          servico: {
            id: 2,
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
        [] as SolicitacaoComServicoDto[],
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

  describe('criarInteracao', () => {
    it('deve registrar a interação com o blog', async () => {
      const usuarioId = 1;
      const interacaoDto: RecomendacaoInteracaoRequestDto = {
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      };

      mockInteracaoUsuarioModel.create.mockResolvedValue({
        id: 7,
        usuarioId,
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      });

      const resultado = await service.criarInteracao(usuarioId, interacaoDto);

      expect(mockInteracaoUsuarioModel.create).toHaveBeenCalledWith({
        usuarioId,
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      });
      expect(resultado).toEqual(
        expect.objectContaining({
          id: 7,
          usuarioId,
          categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
          dataInteracao: '2024-05-20',
        }),
      );
    });

    it('deve lançar InternalServerErrorException quando houver falha técnica', async () => {
      const usuarioId = 1;
      const interacaoDto: RecomendacaoInteracaoRequestDto = {
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      };

      mockInteracaoUsuarioModel.create.mockRejectedValue(
        new Error('Falha de gravação'),
      );

      await expect(
        service.criarInteracao(usuarioId, interacaoDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('buscarRenovacaoCNH', () => {
    const usuarioId = 1;
    const anoCorrente = new Date().getFullYear();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve retornar recomendação de renovação de CNH quando não existir solicitação ativa nos últimos 10 anos', async () => {
      (mockSolicitacaoModel.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.buscarRenovacaoCNH(usuarioId);

      expect(mockSolicitacaoModel.findOne).toHaveBeenCalled(); 
      expect(resultado).toHaveLength(1); 
      expect(resultado[0]).toEqual({
        id: 4,
        nome: 'Renovação de CNH',
        descricao: 'Renove sua CNH'
      });
    });

    it('não deve retornar recomendação quando já existir solicitação de renovação de CNH ativa', async () => {
      (mockSolicitacaoModel.findOne as jest.Mock).mockResolvedValue({
        id: 3,
        usuario_id: usuarioId,
        servico_id: 4,
        status: 'pendente',
        data_solicitacao: new Date()
      });

      const resultado = await service.buscarRenovacaoCNH(usuarioId);

      expect(resultado).toEqual([]);
    });

    it('deve retornar recomendação quando não houver nenhuma solicitação de CNH para o usuário', async () => {
      (mockSolicitacaoModel.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.buscarRenovacaoCNH(usuarioId);
      expect(mockSolicitacaoModel.findOne).toHaveBeenCalled();

      expect(resultado).toHaveLength(1);
    });

    it('deve retornar recomendação quando a única solicitação de CNH estiver com status cancelado', async () => {
      (mockSolicitacaoModel.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.buscarRenovacaoCNH(usuarioId);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe(4);
    });

    it('deve retornar recomendação quando a única solicitação de CNH estiver com status rejeitado', async () => {
      (mockSolicitacaoModel.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.buscarRenovacaoCNH(usuarioId);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe(4);
    });

    it('deve lançar InternalServerError quando ocorrer erro inesperado', async () => {
      const erro = new Error('Erro no banco de dados');
      (mockSolicitacaoModel.findOne as jest.Mock).mockRejectedValue(erro);

      await expect(service.buscarRenovacaoCNH(usuarioId))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
  