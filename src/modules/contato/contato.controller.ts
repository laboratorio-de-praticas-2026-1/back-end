import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { EmpresaDto, TipoEmpresa } from './dto/empresa-response.dto';
import { ContatoUpdateDto } from './dto/contato-update.dto';
import { EnviarEmailDto } from './dto/enviar-email-dto';

@Controller('contato')
export class ContatoController {
  private readonly logger = new Logger(ContatoController.name);

  private readonly EMPRESA_ID = 1;

  constructor(private readonly contatoService: ContatoService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Retorna dados do contato (somente ID = 1 permitido)',
  })
  @ApiOkResponse({ type: EmpresaDto })
  @ApiNotFoundResponse({ description: 'Dados de contato não encontrados' })
  buscarContatoById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaDto> {
    if (id !== this.EMPRESA_ID) {
      throw new ForbiddenException(
        'Somente a empresa com ID = 1 pode ser acessada',
      );
    }

    this.logger.log(`Buscando contato ID: ${id}`);
    return this.contatoService.buscarContatoById(id);
  }

  /*export class EmpresaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nomeFantasia: string;

  @ApiProperty()
  cnpj: string;

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  endereco: string;

  @ApiProperty()
  cidade: string;

  @ApiProperty({
    description: 'Estado da empresa (sigla de 2 letras)',
    example: 'SP',
  })
  @IsString({ message: 'O estado deve ser uma string' })
  @MaxLength(2, { message: 'O estado deve conter no máximo 2 caracteres' })
  estado: string;

  @ApiProperty()
  site: string;

  @ApiProperty({
    description: 'Tipo da empresa',
    required: false,
  })
  @IsEnum({
    enum: TipoEmpresa,
    message: `O tipo deve ser um dos seguintes valores: ${Object.values(TipoEmpresa).join(', ')}`,
  })
  tipo?: TipoEmpresa | null;

  @ApiProperty({
    description: 'Latitude da empresa',
    required: false,
  })
  latitude?: string;

  @ApiProperty({
    description: 'Longitude da empresa',
    required: false,
  })
  longitude?: string;

  @ApiProperty({
    description: 'Endereço completo (endereço + cidade + estado)',
  })
  enderecoCompleto: string; */

  @Put(':id')
  @ApiOperation({
    summary: 'Atualiza dados do contato (somente ID = 1 permitido)',
    requestBody: {
      description: 'Dados a serem atualizados (todos os campos opcionais)',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              nomeFantasia: { type: 'string', example: 'Auto Vistoria' },
              cnpj: { type: 'string', example: '12.345.678/0001-90' },
              telefone: { type: 'string', example: '11987654321' },
              email: { type: 'string', example: 'contato@autovistoria.com.br' },
              endereco: { type: 'string', example: 'Rua Exemplo, 123' },
              cidade: { type: 'string', example: 'São Paulo' },
              estado: {
                type: 'string',
                example: 'SP',
                description: 'Sigla do estado (2 letras)',
              },
              site: { type: 'string', example: 'www.autovistoria.com.br' },
              tipo: {
                type: 'string',
                enum: Object.values(TipoEmpresa),
                example: 'vistoria',
                description: 'Tipo da empresa (clinica, vistoria ou detran)',
              },
              latitude: { type: 'string', example: '-23.55052' },
              longitude: { type: 'string', example: '-46.633308' },
              enderecoCompleto: {
                type: 'string',
                example: 'Rua Exemplo, 123, São Paulo, SP',
                description: 'Endereço completo (endereço + cidade + estado)',
              },
            },
          },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Contato atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado' })
  async atualizarContatoById(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ContatoUpdateDto,
  ): Promise<{ message: string }> {
    if (id !== this.EMPRESA_ID) {
      throw new ForbiddenException(
        'Somente a empresa com ID = 1 pode ser atualizada',
      );
    }

    this.logger.log(`Atualizando contato ID: ${id}`);
    return this.contatoService.atualizarContato(id, data);
  }

  @Post('enviar-email')
  @ApiCreatedResponse({ description: 'Mensagem enviada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async enviarMensagemContato(
    @Body(ValidationPipe) dados: EnviarEmailDto,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Recebendo mensagem de contato de: ${dados.nome} (${dados.email})`,
    );
    return this.contatoService.enviarMensagemContato(dados);
  }
}
