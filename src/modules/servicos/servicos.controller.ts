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
  UseGuards,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { Servico } from 'src/models/servico.model';
import { CreateServicoDto } from './dto/servico-create.dto';
import { UpdateServicoDto } from './dto/servico-update.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';
import { Roles } from '../usuario/decorators/roles.decorator';

@ApiTags('Serviços')
@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços retornada com sucesso',
    type: [Servico],
  })
  findAll(): Promise<Servico[]> {
    return this.servicosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Serviço encontrado com sucesso',
    type: Servico,
  })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Servico> {
    return this.servicosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar serviço por ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: 1 })
  @ApiBody({ type: UpdateServicoDto })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover serviço por ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: 1 })
  @ApiResponse({ status: 200, description: 'Serviço removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async deleteServico(@Param('id', ParseIntPipe) id: number) {
    await this.servicosService.deleteServico(id);
    return {
      message: 'Serviço removido com sucesso',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo serviço' })
  @ApiBody({ type: CreateServicoDto })
  @ApiResponse({ status: 201, description: 'Serviço cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createServico(@Body() servicoDto: CreateServicoDto) {
    return this.servicosService.createServico(servicoDto);
  }
}
