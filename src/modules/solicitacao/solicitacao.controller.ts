import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { SolicitacaoService } from './solicitacao.service';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';

@ApiTags('solicitacao')
@Controller()
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Put('solicitacao/:id')
  @ApiBody({ 
    type: UpdateSolicitacaoStatusDto,
    description: 'Dados para atualização do status da solicitação'
  })
  @ApiOkResponse({ 
    description: 'Status da solicitação atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Status da solicitação atualizado com sucesso.' 
        }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Solicitação não encontrada',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Solicitação com ID 999 não encontrada' 
        },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  async updateSolicitacaoStatus(
    @Param('id') id: string,
    @Body() updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ) {
    return this.solicitacaoService.updateSolicitacaoStatus(
      parseInt(id, 10),
      updateSolicitacaoStatusDto,
    );
  }
}