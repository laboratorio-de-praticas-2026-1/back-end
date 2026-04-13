import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('RecomendacaoController', () => {
  let controller: RecomendacaoController;
  let service: RecomendacaoService;

  const mockRecomendacaoService = {
    obterRecomendacoes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendacaoController],
      providers: [
        {
          provide: RecomendacaoService,
          useValue: mockRecomendacaoService,
        },
      ],
    }).compile();

    controller = module.get<RecomendacaoController>(RecomendacaoController);
    service = module.get<RecomendacaoService>(RecomendacaoService);
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