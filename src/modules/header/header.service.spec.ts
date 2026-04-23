// src/modules/header/header.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderService } from './header.service';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { getModelToken } from '@nestjs/sequelize';
import { Banner } from 'src/models/banner.model';
import { NotFoundException } from '@nestjs/common';

describe('HeaderService', () => {
  let service: HeaderService;

  const mockBanner = {
    id: 1,
    urlImagem: 'https://example.com/banner.jpg',
    descricao: 'Banner de teste',
    ativo: true,
    reload: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
  };

  const mockBannerModel = {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(mockBanner),
    create: jest.fn().mockResolvedValue(mockBanner),
  };

  const mockCloudinaryService = {
    uploadFile: jest.fn().mockResolvedValue({
      secure_url: 'https://cloudinary.com/test.jpg',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderService,
        {
          provide: getModelToken(Banner),
          useValue: mockBannerModel,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<HeaderService>(HeaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBannersAtivos', () => {
    it('should return an array of banners', async () => {
      const mockBanners = [{ id: 1, urlImagem: 'test.jpg', descricao: 'Test' }];
      mockBannerModel.findAll.mockResolvedValue(mockBanners);

      const result = await service.getBannersAtivos();

      expect(mockBannerModel.findAll).toHaveBeenCalledWith({
        where: { ativo: true },
        order: [['id', 'ASC']],
        attributes: [
          ['id', 'id'],
          ['url_imagem', 'urlImagem'],
          ['descricao', 'descricao'],
        ],
        raw: true,
      });
      expect(result).toEqual([
        { id: 1, urlImagem: 'test.jpg', descricao: 'Test' },
      ]);
    });
  });
  describe('listAll', () => {
    it('should return an array of banners', async () => {
      mockBannerModel.findAll.mockResolvedValue([mockBanner]);
      const result = await service.listAll();
      expect(result).toEqual([mockBanner]);
      expect(mockBannerModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a banner by id', async () => {
      const result = await service.findById(1);
      expect(result).toEqual(mockBanner);
      expect(mockBannerModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when banner not found', async () => {
      jest.spyOn(mockBannerModel, 'findByPk').mockResolvedValueOnce(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new banner', async () => {
      const createDto = {
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

      const createdBanner = {
        ...mockBanner,
        reload: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(mockBannerModel, 'create').mockResolvedValue(createdBanner);

      const result = await service.create(createDto, mockFile);
      expect(result).toEqual(createdBanner);
      expect(mockBannerModel.create).toHaveBeenCalledWith({
        urlImagem: 'https://cloudinary.com/test.jpg',
        descricao: createDto.descricao,
        ativo: createDto.ativo,
      });
      expect(mockCloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
    });
  });
});
