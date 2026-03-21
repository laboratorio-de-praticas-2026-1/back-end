// src/modules/header/header.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderService } from './header.service';
import { getModelToken } from '@nestjs/sequelize';
import { Banner } from '../../models/banner.model';

describe('HeaderService', () => {
  let service: HeaderService;

  const mockBannerModel = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderService,
        {
          provide: getModelToken(Banner),
          useValue: mockBannerModel,
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
      const mockBanners = [
        { id: 1, urlImagem: 'test.jpg', descricao: 'Test', ativo: true },
      ];
      mockBannerModel.findAll.mockResolvedValue(mockBanners);

      const result = await service.getBannersAtivos();

      expect(mockBannerModel.findAll).toHaveBeenCalledWith({
        where: { ativo: true },
      });
      expect(result).toEqual([
        { id: 1, url_imagem: 'test.jpg', descricao: 'Test' },
      ]);
    });
  });
});
