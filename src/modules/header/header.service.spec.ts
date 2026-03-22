// src/modules/header/header.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderService } from './header.service';
import { getModelToken } from '@nestjs/sequelize';
import { Banner } from 'src/models/banner.model';
import { NotFoundException } from '@nestjs/common';

describe('HeaderService', () => {
  let service: HeaderService;
  let bannerModel: typeof Banner;

  const mockBanner = {
    id: 1,
    urlImagem: 'https://example.com/banner.jpg',
    descricao: 'Banner de teste',
    ativo: true,
  };

  const mockBannerModel = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderService,
        {
          provide: getModelToken(Banner),
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockBanner]),
            findByPk: jest.fn().mockResolvedValue(mockBanner),
            create: jest.fn().mockResolvedValue(mockBanner),
            reload: jest.fn().mockResolvedValue(mockBanner),
            update: jest.fn().mockResolvedValue(mockBanner),
            destroy: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<HeaderService>(HeaderService);
    bannerModel = module.get<typeof Banner>(getModelToken(Banner));
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
      const result = await service.listAll();
      expect(result).toEqual([mockBanner]);
      expect(bannerModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a banner by id', async () => {
      const result = await service.findById(1);
      expect(result).toEqual(mockBanner);
      expect(bannerModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when banner not found', async () => {
      jest.spyOn(bannerModel, 'findByPk').mockResolvedValueOnce(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new banner', async () => {
      const createDto = {
        urlImagem: 'https://example.com/banner.jpg',
        descricao: 'Banner de teste',
        ativo: true,
      };

      const createdBanner = {
        ...mockBanner,
        reload: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(bannerModel, 'create').mockResolvedValue(createdBanner as any);

      const result = await service.create(createDto);
      expect(result).toEqual(createdBanner);
      expect(bannerModel.create).toHaveBeenCalledWith({
        urlImagem: createDto.urlImagem,
        descricao: createDto.descricao,
        ativo: createDto.ativo,
      });
    });
  });
});
