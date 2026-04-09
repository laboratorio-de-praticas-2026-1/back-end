import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';
import { getModelToken } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('RecomendacaoController', () => {
  let controller: RecomendacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendacaoController],
      providers: [
        RecomendacaoService,
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
