import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { Body, Controller, Logger, Param, Post, Put } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { SolicitacaoService } from './solicitacao.service';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';

@ApiTags('solicitacao')
@Controller()
@Controller('solicitacao')
export class SolicitacaoController {
  private readonly logger = new Logger(SolicitacaoController.name);

  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Put('solicitacao/:id')
  @ApiBody({
    type: UpdateSolicitacaoStatusDto,
    description: 'Dados para atualização do status da solicitação',
  })
  @ApiOkResponse({
    description: 'Status da solicitação atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Status da solicitação atualizado com sucesso.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Solicitação não encontrada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Solicitação com ID 999 não encontrada',
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  updateSolicitacaoStatus(
    @Param('id') id: string,
    @Body() updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ) {
    return this.solicitacaoService.updateSolicitacaoStatus(
      parseInt(id, 10),
      updateSolicitacaoStatusDto,
    );
  }

  @Post()
  criarSolicitacao(@Body() solicitacaoDto: CreateSolicitacaoDto) {
    this.logger.log('Iniciando criacao de solicitacao de servico...');
    return this.solicitacaoService.criarSolicitacao(solicitacaoDto);
  }
}
