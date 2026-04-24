import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';

describe('RecomendacaoController', () => {
  let controller: RecomendacaoController;

  const mockRecomendacaoService = {
    obterRecomendacoes: jest.fn() as jest.MockedFunction<
      (usuarioId: number) => Promise<RecomendacaoRespostaDto[]>
    >,
    criarInteracao: jest.fn() as jest.MockedFunction<
      (
        usuarioId: number,
        interacaoDto: RecomendacaoInteracaoRequestDto,
      ) => Promise<RecomendacaoInteracaoResponseDto>
    >,
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
      ],
    }).compile();

    controller = module.get<RecomendacaoController>(RecomendacaoController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecomendacao', () => {
    it('deve retornar uma lista de recomendações com sucesso', async () => {
      const mockUsuarioId = 1;
      const mockResult: RecomendacaoRespostaDto[] = [
        {
          id: 7,
          nome: 'Licenciamento Anual (CRLV-e)',
          descricao: 'Processo de renovação do documento do veículo.',
        },
      ];

      mockRecomendacaoService.obterRecomendacoes.mockResolvedValue(mockResult);

      const resultado = await controller.getRecomendacao(mockUsuarioId);

      expect(resultado).toEqual(mockResult);
      expect(mockRecomendacaoService.obterRecomendacoes).toHaveBeenCalledWith(
        mockUsuarioId,
      );
      expect(mockRecomendacaoService.obterRecomendacoes).toHaveBeenCalledTimes(
        1,
      );
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

  describe('criarInteracao', () => {
    it('deve criar interação com o blog', async () => {
      const usuarioId = 1;
      const interacaoDto: RecomendacaoInteracaoRequestDto = {
        usuarioId: usuarioId,
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      };
      // const req = { user: { id: usuarioId } };

      mockRecomendacaoService.criarInteracao.mockResolvedValue({
        id: 7,
        usuarioId: usuarioId,
        categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
        dataInteracao: '2024-05-20',
      } as RecomendacaoInteracaoResponseDto);

      const resultado = await controller.criarInteracao(interacaoDto);
      // const resultado = await controller.criarInteracao(req, interacaoDto);

      expect(mockRecomendacaoService.criarInteracao).toHaveBeenCalledWith(
        usuarioId,
        interacaoDto,
      );
      expect(resultado.usuarioId).toBe(usuarioId);
    });
  });
});