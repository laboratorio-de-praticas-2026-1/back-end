import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BuscaService } from './busca.service';
import { BadRequestException } from '@nestjs/common';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { Servico } from 'src/models/servico.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Usuario } from 'src/models/usuario.model';
import { Empresa } from 'src/models/empresa.model';
import { BuscaServicoFiltroDto } from './dto/busca-servico-filtro.dto';
import { BuscaUsuarioFiltroDto } from './dto/busca-usuario-filtro.dto';

describe('BuscaService', () => {
  let service: BuscaService;
  const blogFindAllMock = jest.fn();
  const bannerFindAllMock = jest.fn();
  const servicoFindAllMock = jest.fn();
  const usuarioFindAllMock = jest.fn();
  const publicidadeFindAllMock = jest.fn();
  const empresaFindAllMock = jest.fn();
  type WhereClause = Partial<Record<symbol, unknown>>;

  interface FindAllOptions {
    where?: unknown;
    order?: unknown;
    attributes?: unknown;
    group?: unknown;
    raw?: unknown;
    [key: string]: unknown;
  }

  beforeEach(async () => {
    blogFindAllMock.mockReset();
    bannerFindAllMock.mockReset();
    servicoFindAllMock.mockReset();
    publicidadeFindAllMock.mockReset();
    usuarioFindAllMock.mockReset();
    empresaFindAllMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscaService,
        {
          provide: getModelToken(Blog),
          useValue: {
            findAll: blogFindAllMock,
          },
        },
        {
          provide: getModelToken(Banner),
          useValue: {
            findAll: bannerFindAllMock,
          },
        },
        {
          provide: getModelToken(Servico),
          useValue: {
            findAll: servicoFindAllMock,
          },
        },
        {
          provide: getModelToken(Publicidade),
          useValue: {
            findAll: publicidadeFindAllMock,
          },
        },
        {
          provide: getModelToken(Usuario),
          useValue: {
            findAll: usuarioFindAllMock,
          },
        },
        {
          provide: getModelToken(Empresa),
          useValue: {
            findAll: empresaFindAllMock,
          },
        },
      ],
    }).compile();

    service = module.get<BuscaService>(BuscaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buscarEmpresasPorFiltros', () => {
    it('deve listar empresas sem filtros ordenando por id crescente', async () => {
      const retorno = [{ id: 1 }];
      empresaFindAllMock.mockResolvedValue(retorno);

      await expect(service.buscarEmpresasPorFiltros({})).resolves.toEqual(
        retorno,
      );

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      expect(empresaFindAllMock).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
      });
    });

    it('deve filtrar por tipo quando informado', async () => {
      const retorno = [{ id: 1 }];
      empresaFindAllMock.mockResolvedValue(retorno);

      await expect(
        service.buscarEmpresasPorFiltros({ tipo: 'detran' }),
      ).resolves.toEqual(retorno);

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      const calls = empresaFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = (args.where as WhereClause) ?? {};
      expect(whereClause[Op.and]).toHaveLength(1);
      expect(args.order).toEqual([['id', 'ASC']]);
    });

    it('deve combinar filtros quando mais de um campo é informado', async () => {
      const retorno = [{ id: 1 }];
      empresaFindAllMock.mockResolvedValue(retorno);

      await expect(
        service.buscarEmpresasPorFiltros({
          tipo: 'clinica',
          estado: 'PR',
          cidade: 'Curitiba',
        }),
      ).resolves.toEqual(retorno);

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      const calls = empresaFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = (args.where as WhereClause) ?? {};
      expect(whereClause[Op.and]).toHaveLength(3);
      expect(args.order).toEqual([['id', 'ASC']]);
    });
  });

  describe('listarEstadosEmpresas', () => {
    it('deve retornar apenas UFs únicas, sem nulos/vazios', async () => {
      empresaFindAllMock.mockResolvedValue([
        { estado: 'PR' },
        { estado: 'SP' },
        { estado: 'PR' },
        { estado: null },
        { estado: '  ' },
      ]);

      await expect(service.listarEstadosEmpresas()).resolves.toEqual([
        'PR',
        'SP',
      ]);

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      expect(empresaFindAllMock).toHaveBeenCalledWith({
        attributes: ['estado'],
        group: ['estado'],
        order: [['estado', 'ASC']],
        raw: true,
      });
    });
  });

  describe('listarCidadesEmpresas', () => {
    it('sem estado deve retornar todas as cidades únicas', async () => {
      empresaFindAllMock.mockResolvedValue([
        { cidade: 'Curitiba' },
        { cidade: 'Maringá' },
        { cidade: 'Curitiba' },
        { cidade: null },
        { cidade: '   ' },
      ]);

      await expect(service.listarCidadesEmpresas()).resolves.toEqual([
        'Curitiba',
        'Maringá',
      ]);

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      expect(empresaFindAllMock).toHaveBeenCalledWith({
        attributes: ['cidade'],
        group: ['cidade'],
        order: [['cidade', 'ASC']],
        raw: true,
      });
    });

    it('com estado deve filtrar cidades do estado informado (UF normalizada)', async () => {
      empresaFindAllMock.mockResolvedValue([
        { cidade: 'Curitiba' },
        { cidade: 'Londrina' },
      ]);

      await expect(service.listarCidadesEmpresas(' pr ')).resolves.toEqual([
        'Curitiba',
        'Londrina',
      ]);

      expect(empresaFindAllMock).toHaveBeenCalledTimes(1);
      expect(empresaFindAllMock).toHaveBeenCalledWith({
        attributes: ['cidade'],
        where: { estado: 'PR' },
        group: ['cidade'],
        order: [['cidade', 'ASC']],
        raw: true,
      });
    });
  });

  describe('listarEmpresasByTermo', () => {
    it('deve retornar mensagem quando nao encontrar itens sem filtro', async () => {
      empresaFindAllMock.mockResolvedValue([]);

      const resultado = await service.listarEmpresasByTermo();

      expect(empresaFindAllMock).toHaveBeenCalledWith({
        order: [['id', 'DESC']],
      });
      expect(resultado).toEqual({
        itens: [],
        mensagem: 'Nenhum item foi encontrado.',
      });
    });

    it('deve montar filtro por nome fantasia, cnpj, telefone, cidade e site quando termo textual for informado', async () => {
      empresaFindAllMock.mockResolvedValue([]);

      await service.listarEmpresasByTermo('  curitiba  ');

      expect(empresaFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { nomeFantasia: { [Op.like]: '%curitiba%' } },
            { cnpj: { [Op.like]: '%curitiba%' } },
            { telefone: { [Op.like]: '%curitiba%' } },
            { cidade: { [Op.like]: '%curitiba%' } },
            { site: { [Op.like]: '%curitiba%' } },
          ],
        },
        order: [['id', 'DESC']],
      });
    });

    it('deve retornar itens quando houver correspondencia no filtro', async () => {
      const retorno = [{ id: 10, nomeFantasia: 'Auto Curitiba' }];
      empresaFindAllMock.mockResolvedValue(retorno);

      const resultado = await service.listarEmpresasByTermo('curitiba');

      expect(resultado).toEqual({ itens: retorno, mensagem: undefined });
    });
  });

  it('deve buscar blogs entre datas (incluindo limites)', async () => {
    const retorno = [{ id: 1 }];
    blogFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '2026-01-01',
        ate: '2026-01-31',
      }),
    ).resolves.toEqual(retorno);

    expect(blogFindAllMock).toHaveBeenCalledTimes(1);
    const calls = blogFindAllMock.mock.calls as Array<Array<FindAllOptions>>;
    const args = calls[0]?.[0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(2);
  });

  it('deve buscar blogs a partir de uma data (incluindo limite)', async () => {
    const retorno = [{ id: 1 }];
    blogFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '2026-01-01',
      }),
    ).resolves.toEqual(retorno);

    expect(blogFindAllMock).toHaveBeenCalledTimes(1);
    const calls = blogFindAllMock.mock.calls as Array<Array<FindAllOptions>>;
    const args = calls[0]?.[0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(1);
  });

  it('deve buscar blogs até uma data (incluindo limite)', async () => {
    const retorno = [{ id: 1 }];
    blogFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '2026-01-31',
      }),
    ).resolves.toEqual(retorno);

    expect(blogFindAllMock).toHaveBeenCalledTimes(1);
    const calls = blogFindAllMock.mock.calls as Array<Array<FindAllOptions>>;
    const args = calls[0]?.[0];
    expect(args.where).toBeDefined();
    const whereClause = args.where as WhereClause;
    expect(whereClause[Op.and]).toHaveLength(1);
  });

  it('deve falhar quando nenhuma data é informada', async () => {
    await expect(service.buscarBlogsPorIntervaloDeData({})).rejects.toThrow(
      BadRequestException,
    );

    await expect(service.buscarBlogsPorIntervaloDeData({})).rejects.toThrow(
      'Informe ao menos uma data: "de" ou "ate"',
    );
    expect(blogFindAllMock).not.toHaveBeenCalled();
  });

  it('deve falhar com formato inválido', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '01/01/2026',
        ate: '2026-01-31',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        de: '01/01/2026',
        ate: '2026-01-31',
      }),
    ).rejects.toThrow('Campo "de" deve estar no formato YYYY-MM-DD');
  });

  it('deve falhar com formato inválido quando só uma data é informada', async () => {
    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '31/01/2026',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.buscarBlogsPorIntervaloDeData({
        ate: '31/01/2026',
      }),
    ).rejects.toThrow('Campo "ate" deve estar no formato YYYY-MM-DD');
  });

  it('deve buscar banners ativos quando status=ativo', async () => {
    const retorno = [{ id: 1 }];
    bannerFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarBannerPorStatus({ status: 'ativo' }),
    ).resolves.toEqual(retorno);

    expect(bannerFindAllMock).toHaveBeenCalledTimes(1);
    expect(bannerFindAllMock).toHaveBeenCalledWith({
      where: {
        ativo: true,
      },
    });
  });

  it('deve buscar banners inativos quando status=inativo', async () => {
    const retorno = [{ id: 1 }];
    bannerFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarBannerPorStatus({ status: 'inativo' }),
    ).resolves.toEqual(retorno);

    expect(bannerFindAllMock).toHaveBeenCalledTimes(1);
    expect(bannerFindAllMock).toHaveBeenCalledWith({
      where: {
        ativo: false,
      },
    });
  });

  it('deve buscar publicidades ativas quando status=ativo', async () => {
    const retorno = [{ id: 1 }];
    publicidadeFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarPublicidadePorStatus({ status: 'ativo' }),
    ).resolves.toEqual(retorno);

    expect(publicidadeFindAllMock).toHaveBeenCalledTimes(1);
    expect(publicidadeFindAllMock).toHaveBeenCalledWith({
      where: {
        ativo: true,
      },
    });
  });

  it('deve buscar publicidades inativas quando status=inativo', async () => {
    const retorno = [{ id: 1 }];
    publicidadeFindAllMock.mockResolvedValue(retorno);

    await expect(
      service.buscarPublicidadePorStatus({ status: 'inativo' }),
    ).resolves.toEqual(retorno);

    expect(publicidadeFindAllMock).toHaveBeenCalledTimes(1);
    expect(publicidadeFindAllMock).toHaveBeenCalledWith({
      where: {
        ativo: false,
      },
    });
  });

  it('deve listar blog sem filtro ordenando por id decrescente', async () => {
    blogFindAllMock.mockResolvedValue([]);

    await service.listarBlogByTermo();

    expect(blogFindAllMock).toHaveBeenCalledWith({ order: [['id', 'DESC']] });
  });

  it('deve montar filtro por titulo e conteudo quando termo textual for informado', async () => {
    blogFindAllMock.mockResolvedValue([]);

    await service.listarBlogByTermo('  civic  ');

    expect(blogFindAllMock).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { titulo: { [Op.like]: '%civic%' } },
          { conteudo: { [Op.like]: '%civic%' } },
        ],
      },
      order: [['id', 'DESC']],
    });
  });

  it('deve incluir filtro por id quando termo numerico for informado', async () => {
    blogFindAllMock.mockResolvedValue([]);

    await service.listarBlogByTermo('42');

    expect(blogFindAllMock).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { titulo: { [Op.like]: '%42%' } },
          { conteudo: { [Op.like]: '%42%' } },
          { id: 42 },
        ],
      },
      order: [['id', 'DESC']],
    });
  });

  describe('listarBlogByTermo', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('deve listar blog sem filtro ordenando por id decrescente', async () => {
      blogFindAllMock.mockResolvedValue([]);

      await service.listarBlogByTermo();

      expect(blogFindAllMock).toHaveBeenCalledWith({ order: [['id', 'DESC']] });
    });

    it('deve montar filtro por titulo e conteudo quando termo textual for informado', async () => {
      blogFindAllMock.mockResolvedValue([]);

      await service.listarBlogByTermo('  civic  ');

      expect(blogFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { titulo: { [Op.like]: '%civic%' } },
            { conteudo: { [Op.like]: '%civic%' } },
          ],
        },
        order: [['id', 'DESC']],
      });
    });

    it('deve incluir filtro por id quando termo numerico for informado', async () => {
      blogFindAllMock.mockResolvedValue([]);

      await service.listarBlogByTermo('42');

      expect(blogFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { titulo: { [Op.like]: '%42%' } },
            { conteudo: { [Op.like]: '%42%' } },
            { id: 42 },
          ],
        },
        order: [['id', 'DESC']],
      });
    });
  });

  describe('buscarUsuariosPorFiltros', () => {
    it('deve listar usuarios sem filtros ordenando por id crescente', async () => {
      usuarioFindAllMock.mockResolvedValue([]);
      await service.buscarUsuariosPorFiltros({});

      expect(usuarioFindAllMock).toHaveBeenCalledWith({
        attributes: { exclude: ['senha'] },
        order: [['id', 'ASC']],
      });
    });

    it('deve filtrar por nivel_usuario quando informado', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.buscarUsuariosPorFiltros({
        nivel_usuario: 'cliente',
      } as unknown as BuscaUsuarioFiltroDto);

      expect(usuarioFindAllMock).toHaveBeenCalledTimes(1);
      const calls = usuarioFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      expect(args.where).toBeDefined();
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(1);
      expect(args.order).toEqual([['id', 'ASC']]);
    });

    it('deve filtrar por data_cadastro quando informado', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.buscarUsuariosPorFiltros({
        data_cadastro: '2026-03-03',
      });

      expect(usuarioFindAllMock).toHaveBeenCalledTimes(1);
      const calls = usuarioFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(1);
    });

    it('deve combinar filtros quando mais de um campo é informado', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.buscarUsuariosPorFiltros({
        nivel_usuario: 'administrador',
        data_cadastro: '2026-04-11',
      } as unknown as BuscaUsuarioFiltroDto);

      expect(usuarioFindAllMock).toHaveBeenCalledTimes(1);
      const calls = usuarioFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(2);
    });
  });

  describe('listarBannersByTermo', () => {
    it('deve retornar mensagem quando nao encontrar itens sem filtro', async () => {
      bannerFindAllMock.mockResolvedValue([]);

      const resultado = await service.listarBannersByTermo();

      expect(bannerFindAllMock).toHaveBeenCalledWith({
        order: [['id', 'DESC']],
      });
      expect(resultado).toEqual({
        itens: [],
        mensagem: 'Nenhum item foi encontrado.',
      });
    });

    it('deve montar filtro por descricao quando termo textual for informado', async () => {
      bannerFindAllMock.mockResolvedValue([]);

      await service.listarBannersByTermo('  destaque  ');

      expect(bannerFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ descricao: { [Op.like]: '%destaque%' } }],
        },
        order: [['id', 'DESC']],
      });
    });

    it('deve incluir filtro por id quando termo numerico for informado', async () => {
      bannerFindAllMock.mockResolvedValue([]);

      await service.listarBannersByTermo('7');

      expect(bannerFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ descricao: { [Op.like]: '%7%' } }, { id: 7 }],
        },
        order: [['id', 'DESC']],
      });
    });
  });

  describe('listarPublicidadeByTermo', () => {
    it('deve retornar mensagem quando nao encontrar itens sem filtro', async () => {
      publicidadeFindAllMock.mockResolvedValue([]);

      const resultado = await service.listarPublicidadeByTermo();

      expect(publicidadeFindAllMock).toHaveBeenCalledWith({
        order: [['id', 'DESC']],
      });
      expect(resultado).toEqual({
        itens: [],
        mensagem: 'Nenhum item foi encontrado.',
      });
    });

    it('deve montar filtro por titulo e conteudo quando termo textual for informado', async () => {
      publicidadeFindAllMock.mockResolvedValue([]);

      await service.listarPublicidadeByTermo('  campanha  ');

      expect(publicidadeFindAllMock).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { titulo: { [Op.like]: '%campanha%' } },
            { conteudo: { [Op.like]: '%campanha%' } },
          ],
        },
        order: [['id', 'DESC']],
      });
    });
  });

  describe('buscarServicosPorFiltros', () => {
    it('deve listar servicos sem filtros ordenando por id crescente', async () => {
      servicoFindAllMock.mockResolvedValue([]);

      await service.buscarServicosPorFiltros({});

      expect(servicoFindAllMock).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
      });
    });

    it('deve filtrar por intervalo de valor_base quando informado', async () => {
      servicoFindAllMock.mockResolvedValue([]);

      await service.buscarServicosPorFiltros({
        valor_base_de: 50,
        valor_base_ate: 150,
      });

      expect(servicoFindAllMock).toHaveBeenCalledTimes(1);
      const calls = servicoFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      expect(args.where).toBeDefined();
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(1);
      expect(args.order).toEqual([['id', 'ASC']]);
    });

    it('deve filtrar por intervalo de prazo_estimado quando informado', async () => {
      servicoFindAllMock.mockResolvedValue([]);

      await service.buscarServicosPorFiltros({
        prazo_estimado_de: 10,
        prazo_estimado_ate: 30,
      });

      expect(servicoFindAllMock).toHaveBeenCalledTimes(1);
      const calls = servicoFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(1);
    });

    it('deve filtrar por status quando informado', async () => {
      servicoFindAllMock.mockResolvedValue([]);

      await service.buscarServicosPorFiltros({
        status: 'inativo',
      } as unknown as BuscaServicoFiltroDto);

      expect(servicoFindAllMock).toHaveBeenCalledTimes(1);
      const calls = servicoFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(1);
    });

    it('deve combinar filtros quando mais de um campo é informado', async () => {
      servicoFindAllMock.mockResolvedValue([]);

      await service.buscarServicosPorFiltros({
        valor_base_de: 350,
        valor_base_ate: 500,
        prazo_estimado_de: 5,
        prazo_estimado_ate: 15,
        status: 'ativo',
      } as unknown as BuscaServicoFiltroDto);

      expect(servicoFindAllMock).toHaveBeenCalledTimes(1);
      const calls = servicoFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      const whereClause = args.where as WhereClause;
      expect(whereClause[Op.and]).toHaveLength(3);
    });
  });

  describe('listarUsuariosByTermo', () => {
    it('deve retornar mensagem quando nao encontrar itens sem filtro', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      const resultado = await service.listarUsuariosByTermo();

      expect(usuarioFindAllMock).toHaveBeenCalledWith({
        attributes: { exclude: ['senha'] },
        order: [['id', 'DESC']],
      });
      expect(resultado).toEqual({
        itens: [],
        mensagem: 'Nenhum item foi encontrado.',
      });
    });

    it('deve montar filtro por nome, email, cpf/cnpj e celular quando termo textual for informado', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.listarUsuariosByTermo('  joao  ');

      expect(usuarioFindAllMock).toHaveBeenCalledWith({
        attributes: { exclude: ['senha'] },
        where: {
          [Op.or]: [
            { nome: { [Op.like]: '%joao%' } },
            { email: { [Op.like]: '%joao%' } },
            { cpfCnpj: { [Op.like]: '%joao%' } },
            { celular: { [Op.like]: '%joao%' } },
          ],
        },
        order: [['id', 'DESC']],
      });
    });

    it('deve incluir filtro de data de cadastro quando termo estiver no formato YYYY-MM-DD', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.listarUsuariosByTermo('2026-04-15');

      expect(usuarioFindAllMock).toHaveBeenCalledTimes(1);
      const calls = usuarioFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      expect(args.attributes).toEqual({ exclude: ['senha'] });
      expect(args.where).toBeDefined();
      const whereClause = args.where as WhereClause;
      const filtros = whereClause[Op.or] as unknown[];
      expect(Array.isArray(filtros)).toBe(true);
      expect(filtros).toHaveLength(5);
    });

    it('deve incluir filtro de data de cadastro quando termo estiver no formato DD/MM/YYYY', async () => {
      usuarioFindAllMock.mockResolvedValue([]);

      await service.listarUsuariosByTermo('15/04/2026');

      expect(usuarioFindAllMock).toHaveBeenCalledTimes(1);
      const calls = usuarioFindAllMock.mock.calls as Array<
        Array<FindAllOptions>
      >;
      const args = calls[0]?.[0];
      expect(args.attributes).toEqual({ exclude: ['senha'] });
      expect(args.where).toBeDefined();
      const whereClause = args.where as WhereClause;
      const filtros = whereClause[Op.or] as unknown[];
      expect(Array.isArray(filtros)).toBe(true);
      expect(filtros).toHaveLength(5);
    });
  });
});
