// src/modules/header/header.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';
import { AdminGuard } from '../usuario/guards/admin.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('HeaderController', () => {
  let controller: HeaderController;

  const mockBanner = {
    id: 1,
    urlImagem: 'https://example.com/banner.jpg',
    descricao: 'Banner de teste',
    ativo: true,
  };

  const mockFile = {
    fieldname: 'imagem',
    originalname: 'banner.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-content'),
    size: 1234,
  } as Express.Multer.File;

  const headerServiceMock = {
    listAll: jest.fn().mockResolvedValue([mockBanner]),
    findById: jest.fn().mockResolvedValue(mockBanner),
    create: jest.fn().mockResolvedValue(mockBanner),
    update: jest.fn().mockResolvedValue(mockBanner),
    delete: jest.fn().mockResolvedValue(undefined),
    getBannersAtivos: jest.fn().mockResolvedValue([mockBanner]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeaderController],
      providers: [
        {
          provide: HeaderService,
          useValue: headerServiceMock,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<HeaderController>(HeaderController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of banners', async () => {
      const result = await controller.getAll();
      expect(result).toEqual([mockBanner]);
      expect(headerServiceMock.listAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a banner by id', async () => {
      const result = await controller.getById('1');
      expect(result).toEqual(mockBanner);
      expect(headerServiceMock.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new banner with image', async () => {
      const createDto = {
        descricao: 'Banner de teste',
        ativo: true,
      };

      const result = await controller.create(createDto, mockFile);

      expect(result).toEqual(mockBanner);
      expect(headerServiceMock.create).toHaveBeenCalledWith(
        createDto,
        mockFile,
      );
    });
  });

  describe('update', () => {
    it('should update a banner with optional image', async () => {
      const updateDto = { ativo: false };

      const result = await controller.update(1, updateDto, mockFile);

      expect(result).toEqual(mockBanner);
      expect(headerServiceMock.update).toHaveBeenCalledWith(
        1,
        updateDto,
        mockFile,
      );
    });
  });

  describe('delete', () => {
    it('should delete a banner', async () => {
      const result = await controller.delete(1);
      expect(result).toEqual({
        message: 'Banner do header com ID 1 removido com sucesso',
      });
      expect(headerServiceMock.delete).toHaveBeenCalledWith(1);
    });
  });
});
