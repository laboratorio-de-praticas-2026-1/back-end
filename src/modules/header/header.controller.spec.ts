// src/modules/header/header.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';

describe('HeaderController', () => {
  let controller: HeaderController;
  let service: HeaderService;

  const mockBanner = {
    id: 1,
    urlImagem: 'https://example.com/banner.jpg',
    descricao: 'Banner de teste',
    ativo: true,
  };

  const headerServiceMock = {
    listAll: jest.fn().mockResolvedValue([mockBanner]),
    findById: jest.fn().mockResolvedValue(mockBanner),
    create: jest.fn().mockResolvedValue(mockBanner),
    update: jest.fn().mockResolvedValue(mockBanner),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeaderController],
      providers: [
        HeaderService,
        {
          provide: HeaderService,
          useValue: headerServiceMock,
        },
      ],
    }).compile();

    controller = module.get<HeaderController>(HeaderController);
    service = module.get<HeaderService>(HeaderService);
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
    it('should create a new banner', async () => {
      const createDto = {
        urlImagem: 'https://example.com/banner.jpg',
        descricao: 'Banner de teste',
        ativo: true,
      };

      const result = await controller.create(createDto);
      expect(result).toEqual(mockBanner);
      expect(headerServiceMock.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a banner', async () => {
      const updateDto = { ativo: false };
      const result = await controller.update('1', updateDto);
      expect(result).toEqual(mockBanner);
      expect(headerServiceMock.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a banner', async () => {
      const result = await controller.delete('1');
      expect(result).toEqual({
        message: 'Banner do header com ID 1 removido com sucesso',
      });
      expect(headerServiceMock.delete).toHaveBeenCalledWith(1);
    });
  });
});
