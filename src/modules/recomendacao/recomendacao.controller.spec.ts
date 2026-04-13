import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('RecomendacaoController', () => {
  let controller: RecomendacaoController;
  let service: RecomendacaoService;

  const mockRecomendacaoService = {
    obterRecomendacoes: jest.fn(),
  };

  const mockRecomendacaoService = {
    criarInteracao: jest.fn() as jest.MockedFunction<
      (
        usuarioId: number,
        interacaoDto: RecomendacaoInteracaoRequestDto,
      ) => Promise<RecomendacaoInteracaoResponseDto>
    >,
    buscarAtributosPerfil: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendacaoController],
      providers: [
        RecomendacaoService,
        {
          provide: RecomendacaoService,
          useValue: mockRecomendacaoService,
        },
        {
          provide: getModelToken(Servico),
          useValue: {},
        },
        {
          provide: RecomendacaoService,
          useValue: mockRecomendacaoService,
        },
      ],
    }).compile();

    controller = module.get<RecomendacaoController>(RecomendacaoController);
    service = module.get<RecomendacaoService>(RecomendacaoService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecomendacao', () => {
    it('deve retornar uma lista de recomendações com sucesso', async () => {
      // Dados de exemplo que o Service "fingiria" retornar
      const mockResult: RecomendacaoRespostaDto[] = [
        {
          id: 7,
          nome: 'Licenciamento Anual (CRLV-e)',
          descricao: 'Processo de renovação do documento do veículo.',
          ativo: true,
        },
      ];

      mockRecomendacaoService.obterRecomendacoes.mockResolvedValue(mockResult);

      const resultado = await controller.getRecomendacao(1);

      expect(resultado).toEqual(mockResult);
      expect(mockRecomendacaoService.obterRecomendacoes).toHaveBeenCalledWith(1);
      expect(mockRecomendacaoService.obterRecomendacoes).toHaveBeenCalledTimes(1);
    });

    it('deve repassar exceções do service (ex: erro 500)', async () => {
      mockRecomendacaoService.obterRecomendacoes.mockRejectedValue(
        new InternalServerErrorException('Erro no servidor'),
      );

      await expect(controller.getRecomendacao(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
  it('deve criar interação com o blog', async () => {
    const interacaoDto: RecomendacaoInteracaoRequestDto = {
      categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
      dataInteracao: '2024-05-20',
    };
    // const req = { user: { id: 1 } };

    mockRecomendacaoService.criarInteracao.mockResolvedValue({
      id: 1,
      usuarioId: 1,
      categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
      dataInteracao: '2024-05-20',
    } as RecomendacaoInteracaoResponseDto);

    await controller.criarInteracao(interacaoDto);

    expect(mockRecomendacaoService.criarInteracao).toHaveBeenCalledWith(
      1,
      interacaoDto,
    );
  });
});
