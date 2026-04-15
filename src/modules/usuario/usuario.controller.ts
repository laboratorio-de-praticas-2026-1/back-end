import {
  Controller,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastra um novo usuário no sistema' })
  @ApiCreatedResponse({
    description: 'Usuário cadastrado com sucesso',
    type: ResponseUsuarioDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou campos obrigatórios ausentes',
  })
  @ApiConflictResponse({ description: 'E-mail já cadastrado no sistema' })
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(UsuarioOwnerGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }

  @Patch(':id')
  @UseGuards(UsuarioOwnerGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }
}
