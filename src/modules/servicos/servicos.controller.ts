import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ServicosService } from './servicos.service';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() body: { nome: string; descricao?: string }) {
    await this.servicosService.criarServico(
      body.nome,
      body.descricao,
    );

    return {
      message: 'Serviço criado com sucesso',
    };
  }
}