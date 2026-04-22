import {
  Controller,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
  Post,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';
import { AdminGuard } from './guards/admin.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateAdminUsuarioDto } from './dto/create-admin.dto';

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

  @Post('/admin/usuarios')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um usuário via painel administrativo' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: ResponseUsuarioDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido ou sem permissão de administrador',
  })
  @ApiConflictResponse({ description: 'E-mail ou CPF/CNPJ já cadastrado' })
  createByAdmin(@Body() createAdminUsuarioDto: CreateAdminUsuarioDto) {
    return this.usuarioService.createByAdmin(createAdminUsuarioDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário e retorna o token JWT' })
  @ApiOkResponse({ description: 'Login realizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Email ou senha inválidos' })
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuarioService.login(loginUsuarioDto);
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

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(UsuarioOwnerGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }
}
