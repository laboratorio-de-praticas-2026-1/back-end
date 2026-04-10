import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ServicosService } from './servicos.service';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  criar(
    @Body()
    body: {
      nome: string;
      descricao: string;
      valor_base: number;
      prazo_estimado_dias: number;
      ativo: boolean;
    },
  ) {
    this.servicosService.criarServico(
      body.nome,
      body.descricao,
      body.valor_base,
      body.prazo_estimado_dias,
      body.ativo,
    );

    return {
      message: 'Serviço criado com sucesso',
    };
  }
}
