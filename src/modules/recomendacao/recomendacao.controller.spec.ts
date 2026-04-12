import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('RecomendacaoController', () => {
  let controller: RecomendacaoController;

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
          provide: getModelToken(Solicitacao),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RecomendacaoController>(RecomendacaoController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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