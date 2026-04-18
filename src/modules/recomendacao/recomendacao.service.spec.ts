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
    findOne: jest.fn() as jest.MockedFunction<
      () => Promise<InteracaoUsuario | null>
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
    it('deve retornar recomendação de parcelamento (ID 10) se houver débitos pendentes', async () => {
      mockVeiculoModel.findAll.mockResolvedValue([{ id: 10 } as Veiculo]);
      mockDebitoModel.findAll.mockResolvedValue([
        { id: 1, status: 'pendente', tipo: 'veiculo', veiculos: [{ id: 10 }] },
      ] as unknown as Partial<Debito>[]);
      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarParcelamentoDebitos(1);
      expect(resultado?.id).toBe(10);
    });

    it('deve retornar null se não houver débitos (não deve chamar o próximo método)', async () => {
      mockVeiculoModel.findAll.mockResolvedValue([]);
      const resultado = await service.buscarParcelamentoDebitos(1);
      expect(resultado).toBeNull();
    });
  });

  describe('buscarLicenciamentoAnual', () => {
    it('deve retornar recomendação de licenciamento se o veículo estiver no período e não houver solicitação ativa', async () => {
      const mesAtual = new Date().getMonth() + 1;

      // Encontrar um dígito cujo gatilho seja <= mesAtual
      const gatilhoPorDigito: Record<string, number> = {
        '1': 3,
        '2': 4,
        '3': 5,
        '4': 6,
        '5': 7,
        '6': 7,
        '7': 8,
        '8': 9,
        '9': 10,
        '0': 11,
      };
      const digitoElegivel =
        Object.entries(gatilhoPorDigito).find(
          ([, gatilho]) => mesAtual >= gatilho,
        )?.[0] ?? '1';

      mockVeiculoModel.findAll.mockResolvedValue([
        { id: 5, placa: `ABC123${digitoElegivel}` } as unknown as Veiculo,
      ]);
      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarLicenciamentoAnual(1);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(1);
      expect(resultado?.nome).toBe('Licenciamento Anual');
    });

    it('deve retornar null se o veículo ainda não atingiu o mês de gatilho', async () => {
      // Dígito '0' tem gatilho em novembro (11), só dispara se mesAtual >= 11
      // Forçamos um cenário onde o mês atual é anterior ao gatilho
      mockVeiculoModel.findAll.mockResolvedValue([
        { id: 5, placa: 'ABC1230', ativo: true } as unknown as Veiculo,
      ]);

      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // Janeiro

      const resultado = await service.buscarLicenciamentoAnual(1);
      expect(resultado).toBeNull();

      jest.restoreAllMocks();
    });

    it('deve retornar null se já existe solicitação ativa no ano corrente', async () => {
      const mesAtual = new Date().getMonth() + 1;
      const gatilhoPorDigito: Record<string, number> = {
        '1': 3,
        '2': 4,
        '3': 5,
        '4': 6,
        '5': 7,
        '6': 7,
        '7': 8,
        '8': 9,
        '9': 10,
        '0': 11,
      };
      const digitoElegivel =
        Object.entries(gatilhoPorDigito).find(
          ([, gatilho]) => mesAtual >= gatilho,
        )?.[0] ?? '1';

      mockVeiculoModel.findAll.mockResolvedValue([
        {
          id: 5,
          placa: `ABC123${digitoElegivel}`,
          ativo: true,
        } as unknown as Veiculo,
      ]);
      mockSolicitacaoModel.findOne.mockResolvedValue({
        id: 99,
        status: 'pendente',
      } as unknown as Solicitacao);

      const resultado = await service.buscarLicenciamentoAnual(1);
      expect(resultado).toBeNull();
    });
  });

  describe('buscarComunicacaoVenda', () => {
    it('deve retornar recomendação (ID 9) quando houver interesse no blog (Documentação)', async () => {
      mockInteracaoUsuarioModel.findOne.mockResolvedValue({
        id: 1,
      } as unknown as InteracaoUsuario);
      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarComunicacaoVenda(6);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(9);
      expect(resultado?.nome).toBe('Comunicação de Venda');
    });

    it('deve retornar recomendação (ID 9) quando houver solicitação de transferência (ID 2)', async () => {
      mockInteracaoUsuarioModel.findOne.mockResolvedValue(null);
      mockSolicitacaoModel.findOne.mockResolvedValue({
        id: 100,
        servicoId: 2,
      } as unknown as Solicitacao);

      const resultado = await service.buscarComunicacaoVenda(6);

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe(9);
    });

    it('deve retornar null quando não houver indícios de venda', async () => {
      mockInteracaoUsuarioModel.findOne.mockResolvedValue(null);
      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      const resultado = await service.buscarComunicacaoVenda(6);

      expect(resultado).toBeNull();
    });

    it('deve retornar null em caso de erro técnico para não travar o fluxo', async () => {
      mockInteracaoUsuarioModel.findOne.mockRejectedValue(
        new Error('Erro de banco'),
      );

      const resultado = await service.buscarComunicacaoVenda(6);

      expect(resultado).toBeNull();
    });
  });

  describe('obterRecomendacoes', () => {
    it('deve retornar uma lista com múltiplos serviços se o usuário tiver multa e venda', async () => {
      jest.spyOn(service, 'buscarLicenciamentoAnual').mockResolvedValue(null);
      jest.spyOn(service, 'buscarRecursoMulta').mockResolvedValue({
        id: 6,
        nome: 'Multa',
        descricao: '...',
        ativo: true,
      });
      jest.spyOn(service, 'buscarParcelamentoDebitos').mockResolvedValue(null);
      jest.spyOn(service, 'buscarComunicacaoVenda').mockResolvedValue({
        id: 9,
        nome: 'Venda',
        descricao: '...',
        ativo: true,
      });

      const resultado = await service.obterRecomendacoes(1);

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).not.toHaveProperty('ativo');
      expect(resultado[1]).not.toHaveProperty('ativo');
      expect(resultado[0].id).toBe(6);
      expect(resultado[1].id).toBe(9);
    });

    it('deve retornar serviços populares se a lista de prioridades estiver vazia', async () => {
      jest.spyOn(service, 'buscarLicenciamentoAnual').mockResolvedValue(null);
      jest.spyOn(service, 'buscarRecursoMulta').mockResolvedValue(null);
      jest.spyOn(service, 'buscarParcelamentoDebitos').mockResolvedValue(null);
      jest.spyOn(service, 'buscarComunicacaoVenda').mockResolvedValue(null);
      jest
        .spyOn(
          service as unknown as {
            buscarAtributosPerfil: (usuarioId: number) => Promise<[]>;
          },
          'buscarAtributosPerfil',
        )
        .mockResolvedValue([]);

      const mockPopulares = [{ id: 1, nome: 'Popular', descricao: '...' }];
      jest
        .spyOn(
          service as unknown as {
            buscarServicosPopulares: () => Promise<
              { id: number; nome: string; descricao: string }[]
            >;
          },
          'buscarServicosPopulares',
        )
        .mockResolvedValue(mockPopulares);
      const resultado = await service.obterRecomendacoes(1);
      expect(resultado).toEqual(mockPopulares);
      expect(resultado[0]).not.toHaveProperty('ativo');
    });
  });
});
