import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { ReciboController } from './recibo.controller';
import { ReciboService } from './recibo.service';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ReciboController', () => {
  let controller: ReciboController;
  let reciboService: {
    create: jest.Mock;
    previewDownload: jest.Mock;
  };

  beforeEach(async () => {
    reciboService = {
      create: jest.fn(),
      previewDownload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReciboController],
      providers: [{ provide: ReciboService, useValue: reciboService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ReciboController>(ReciboController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar a geração do recibo para o service', async () => {
    reciboService.create.mockResolvedValue({ urlDownload: 'https://temp-url.com' });
    const mockReq = { user: { id: 1, nivel: 'cliente' as const } };

    const resultado = await controller.create({ idSolicitacao: 1 } as any, mockReq);

    expect(reciboService.create).toHaveBeenCalledWith({ idSolicitacao: 1 }, 1, 'cliente');
    expect(resultado).toEqual({ urlDownload: 'https://temp-url.com' });
  });

  it('deve retornar StreamableFile e definir header de download', async () => {
    const buffer = Buffer.from('pdf-content');
    reciboService.previewDownload.mockResolvedValue(buffer);
    const res = { setHeader: jest.fn() } as any;
    const mockReq = { user: { id: 7, nivel: 'cliente' as const } };

    const resultado = await controller.previewDownload(
      { idSolicitacao: 7 } as any,
      res,
      mockReq,
    );

    expect(reciboService.previewDownload).toHaveBeenCalledWith({ idSolicitacao: 7 }, 7, 'cliente');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="recibo-solicitacao.pdf"',
    );
    expect(resultado).toBeInstanceOf(StreamableFile);
  });
});
