import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { ReciboController } from './recibo.controller';
import { ReciboService } from './recibo.service';

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
    }).compile();

    controller = module.get<ReciboController>(ReciboController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar a geração do recibo para o service', async () => {
    reciboService.create.mockResolvedValue({ urlDownload: 'https://temp-url.com' });

    const resultado = await controller.create({ idSolicitacao: 1 } as any);

    expect(reciboService.create).toHaveBeenCalledWith({ idSolicitacao: 1 });
    expect(resultado).toEqual({ urlDownload: 'https://temp-url.com' });
  });

  it('deve retornar StreamableFile e definir header de download', async () => {
    const buffer = Buffer.from('pdf-content');
    reciboService.previewDownload.mockResolvedValue(buffer);
    const res = {
      setHeader: jest.fn(),
    } as any;

    const resultado = await controller.previewDownload(
      { idSolicitacao: 7 } as any,
      res,
    );

    expect(reciboService.previewDownload).toHaveBeenCalledWith({ idSolicitacao: 7 });
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="recibo-solicitacao.pdf"',
    );
    expect(resultado).toBeInstanceOf(StreamableFile);
  });
});
