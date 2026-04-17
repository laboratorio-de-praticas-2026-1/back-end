import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

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
}
