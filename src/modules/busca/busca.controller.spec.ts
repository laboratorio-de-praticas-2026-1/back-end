import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BuscaController } from './busca.controller';
import { BuscaService } from './busca.service';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';

describe('BuscaController', () => {
  let controller: BuscaController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        SequelizeModule.forRoot({
          dialect: 'mysql',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
          username: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_DB,
          models: [Blog, Banner],
          autoLoadModels: true,
          define: {
            timestamps: false,
          },
          synchronize: false,
        }),
        SequelizeModule.forFeature([Blog, Banner]),
      ],
      controllers: [BuscaController],
      providers: [
        {
          provide: BuscaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BuscaController>(BuscaController);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
