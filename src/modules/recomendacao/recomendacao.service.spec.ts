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
import { Debito } from 'src/models/debito.model';
import { Veiculo } from 'src/models/veiculo.model';

describe('RecomendacaoService', () => {
  let service: RecomendacaoService;

  const mockSolicitacaoModel = {
    findAll: jest.fn() as jest.MockedFunction<
      () => Promise<SolicitacaoComServicoDto[]>
    >,
    findOne: jest.fn() as jest.MockedFunction<
      () => Promise<Solicitacao | null>
    >,
  };

  const mockServicoModel = {
    findAll: jest.fn() as jest.MockedFunction<() => Promise<Servico[]>>,
  };

  const mockInteracaoUsuarioModel = {
    create: jest.fn() as jest.MockedFunction<
      (interacaoRegistro: {
        usuarioId: number;
        categoriaBlog: RecomendacaoCategoriaBlogEnum;
        dataInteracao: string;
      }) => Promise<RecomendacaoInteracaoResponseDto>
    >,
  };

  const mockDebitoModel = {
    findAll: jest.fn() as jest.MockedFunction<() => Promise<Partial<Debito>[]>>,
  };

  const mockVeiculoModel = {
    findAll: jest.fn() as jest.MockedFunction<() => Promise<Veiculo[]>>,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDebitoModel.findAll.mockResolvedValue([]);
    mockSolicitacaoModel.findOne.mockResolvedValue(null);
    mockServicoModel.findAll.mockResolvedValue([]);

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
        {
          provide: getModelToken(Debito),
          useValue: mockDebitoModel,
        },
        {
          provide: getModelToken(Veiculo),
          useValue: mockVeiculoModel,
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

  describe('buscarRecursoMulta', () => {
    it('deve retornar recomendação de multa se houver débitos', async () => {
      mockDebitoModel.findAll.mockResolvedValue([
        {
          descricao: 'MULTA X',
          veiculos: [{ id: 10 }] as unknown as Debito['veiculos'],
        },
      ]);

      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarRecursoMulta(1);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(6);
    });
  });

  describe('buscarParcelamentoDebitos', () => {
    it('deve retornar recomendação de parcelamento (ID 10) se houver débitos pendentes e nenhuma solicitação ativa', async () => {
      mockVeiculoModel.findAll.mockResolvedValue([
        { id: 10, usuarioId: 1 } as Veiculo,
      ]);

      mockDebitoModel.findAll.mockResolvedValue([
        {
          id: 1,
          status: 'pendente',
          tipo: 'veiculo',
          veiculos: [{ id: 10 }] as unknown as Veiculo[],
        },
      ]);

      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarParcelamentoDebitos(1);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(10);
      expect(resultado?.nome).toBe('Parcelamento de Débitos');
    });

    it('deve chamar buscarComunicacaoVenda se o usuário já tiver uma solicitação de parcelamento ativa', async () => {
      mockVeiculoModel.findAll.mockResolvedValue([{ id: 10 } as Veiculo]);
      mockDebitoModel.findAll.mockResolvedValue([
        { id: 1, veiculos: [{ id: 10 }] as unknown as Veiculo[] },
      ]);
      mockSolicitacaoModel.findOne.mockResolvedValue({
        id: 500,
        status: 'pendente',
      } as unknown as Solicitacao);

      const spyProximoPasso = jest.spyOn(
        service as unknown as {
          buscarComunicacaoVenda: (usuarioId: number) => Promise<null>;
        },
        'buscarComunicacaoVenda',
      );

      await service.buscarParcelamentoDebitos(1);

      expect(spyProximoPasso).toHaveBeenCalledWith(1);
    });
  });
});
