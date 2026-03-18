import { Module } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';

@Module({
  controllers: [ServicosController],
  providers: [ServicosService],
})
export class ServicosModule {}
