import {
  Controller,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

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
