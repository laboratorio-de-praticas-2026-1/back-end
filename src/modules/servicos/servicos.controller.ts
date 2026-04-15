import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { Servico } from 'src/models/servico.model';
import { CreateServicoDto } from './dto/servico-create.dto';
import { UpdateServicoDto } from './dto/servico-update.dto';

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
  async updateServico(
    @Param('id', ParseIntPipe) id: number,
    @Body() servicoDto: UpdateServicoDto,
  ) {
    await this.servicosService.updateServico(id, servicoDto);
    return {
      message: 'Serviço atualizado com sucesso',
    };
  }

  @Delete(':id')
  async deleteServico(@Param('id', ParseIntPipe) id: number) {
    await this.servicosService.deleteServico(id);
    return {
      message: 'Serviço removido com sucesso',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createServico(@Body() servicoDto: CreateServicoDto) {
    return this.servicosService.createServico(servicoDto);
  }
}
