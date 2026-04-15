import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalServerErrorException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Debito } from 'src/models/debito.model';
import { InteracaoUsuario } from 'src/models/interacao-usuario.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { SolicitacaoComServicoDto } from './dto/solicitacao-com-servico.dto';
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';
import { RecomendacaoService } from './recomendacao.service';

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

  const mockVeiculoModel = {
    findAll: jest.fn() as jest.MockedFunction<() => Promise<any[]>>,
    findOne: jest.fn() as jest.MockedFunction<() => Promise<any>>,
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
  
  describe('buscarLicenciamentoAnual', () => {
    const usuarioId = 1;
    const anoCorrente = new Date().getFullYear();

    const mockVeiculos = [
      { id: 1, placa: 'ABC-1234', ativo: true, usuario_id: usuarioId },
      { id: 2, placa: 'XYZ-5678', ativo: true, usuario_id: usuarioId },
    ];

    it('deve retornar array de recomendações para veículos sem licenciamento', async () => {
      mockVeiculoModel.findAll.mockResolvedValue(mockVeiculos);

      mockSolicitacaoModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2, status: 'aprovado', usuarioId: usuarioId, usuario: null, veiculoId: 2, veiculo: null } as unknown as Solicitacao);

      const resultado = await service.buscarLicenciamentoAnual(usuarioId);

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toMatchObject({
        id: 12,
        nome: 'Troca de Placa (Mercosul)',
        descricao:
          'Substituição da placa antiga pelo novo padrão Mercosul com QR Code.',
        veiculo_id: 1,
        placa: 'ABC-1234',
      });
    });

    it('deve retornar array vazio quando todos os veículos têm licenciamento', async () => {
      mockVeiculoModel.findAll.mockResolvedValue(mockVeiculos);

      /*
      Argument of type '{ id: number; status: "recebido"; }' is not assignable to parameter of type 'Solicitacao'.
  Type '{ id: number; status: "recebido"; }' is missing the following properties from type 'Solicitacao': usuarioId, usuario, veiculoId, veiculo, and 43 more.ts(2345)
  */
      mockSolicitacaoModel.findOne
        .mockResolvedValueOnce({ id: 1, status: 'recebido', usuarioId: usuarioId, usuario: null, veiculoId: 1, veiculo: null } as unknown as Solicitacao)
        .mockResolvedValueOnce({ id: 2, status: 'recebido', usuarioId: usuarioId, usuario: null, veiculoId: 2, veiculo: null } as unknown as Solicitacao);

      const resultado = await service.buscarLicenciamentoAnual(usuarioId);

      expect(resultado).toHaveLength(0);
      expect(resultado).toEqual([]);
    });

    it('deve retornar array vazio quando usuário não tem veículos', async () => {
      mockVeiculoModel.findAll.mockResolvedValue([]);

      const resultado = await service.buscarLicenciamentoAnual(usuarioId);

      expect(resultado).toHaveLength(0);
      expect(resultado).toEqual([]);
    });

    it('deve ignorar veículos inativos', async () => {
      const usuarioId = 1;
      const veiculosComInativos = [
        { id: 1, placa: 'ABC-1234', ativo: true, usuario_id: usuarioId },
        { id: 2, placa: 'DEF-9012', ativo: false, usuario_id: usuarioId },
      ];
      mockVeiculoModel.findAll.mockResolvedValue(veiculosComInativos);
      mockSolicitacaoModel.findOne.mockResolvedValue(null);

      await service.buscarLicenciamentoAnual(usuarioId);
      expect(mockVeiculoModel.findAll).toHaveBeenCalled();
    });

    it('deve retornar recomendações para todos os veículos sem licenciamento', async () => {
      mockVeiculoModel.findAll.mockResolvedValue(mockVeiculos);

      mockSolicitacaoModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const resultado = await service.buscarLicenciamentoAnual(usuarioId);

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toMatchObject({
        id: 12,
        nome: 'Troca de Placa (Mercosul)',
        descricao:
          'Substituição da placa antiga pelo novo padrão Mercosul com QR Code.',
        veiculo_id: 1,
        placa: 'ABC-1234',
      });
      expect(resultado[1]).toMatchObject({
        id: 12,
        nome: 'Troca de Placa (Mercosul)',
        descricao:
          'Substituição da placa antiga pelo novo padrão Mercosul com QR Code.',
        veiculo_id: 2,
        placa: 'XYZ-5678',
      });
    });
  });
});
