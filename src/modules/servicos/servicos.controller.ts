import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { Servico } from 'src/models/servico.model';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  findAll(): Promise<Servico[]> {
    return this.servicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Servico> {
    return this.servicosService.findOne(id);
  }

  @Patch(':id')
  updateServico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<Servico>,
  ): Promise<Servico> {
    return this.servicosService.updateServico(id, dados);
  }

  @Delete(':id')
  deleteServico(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.servicosService.deleteServico(id);
  }
}
