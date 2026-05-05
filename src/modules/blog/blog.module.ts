import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { Blog } from 'src/models/blog.model';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Blog]),
    CloudinaryModule,
    UsuarioModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
