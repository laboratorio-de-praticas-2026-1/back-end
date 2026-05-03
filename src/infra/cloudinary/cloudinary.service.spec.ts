jest.mock('streamifier', () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Readable } from 'stream';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockFile: Express.Multer.File = {
    fieldname: 'imagem',
    originalname: 'imagem.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake image'),
    destination: '',
    filename: '',
    path: '',
    stream: new Readable(),
  };

  const mockCloudinary = {
    uploader: {
      upload_stream: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: 'CLOUDINARY',
          useValue: mockCloudinary,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('deve fazer upload da imagem com sucesso', async () => {
    const mockResponse = {
      secure_url: 'http://cloudinary.com/test.png',
    };

    mockCloudinary.uploader.upload_stream.mockImplementation(
      (
        _options,
        callback: (
          error: Error | null,
          result?: { secure_url: string },
        ) => void,
      ) => {
        callback(null, mockResponse);
        return { end: jest.fn() };
      },
    );

    const result = await service.uploadFile(mockFile);

    expect(result).toEqual(mockResponse);
    expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalled();
  });

  it('deve lançar erro quando o cloudinary falhar', async () => {
    mockCloudinary.uploader.upload_stream.mockImplementation(
      (
        _options,
        callback: (
          error: Error | null,
          result?: { secure_url: string },
        ) => void,
      ) => {
        callback(new Error('upload error'));
        return { end: jest.fn() };
      },
    );

    await expect(service.uploadFile(mockFile)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
