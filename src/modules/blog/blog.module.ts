import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Sequelize } from 'sequelize';
import { SequelizeModule } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';

@Module({
  imports: [SequelizeModule.forFeature([Blog])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
