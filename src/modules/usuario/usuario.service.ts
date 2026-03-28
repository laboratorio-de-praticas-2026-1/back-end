import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../models/usuario.model';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
  ) {}

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOneOrFail(id);

    if (updateUsuarioDto.email) {
      await this.verificarEmailUnico(updateUsuarioDto.email, id);
    }

    if (updateUsuarioDto.senha) {
      updateUsuarioDto.senha = await bcrypt.hash(updateUsuarioDto.senha, 10);
    }

    await usuario.update(updateUsuarioDto);

    return usuario;
  }

  private async findOneOrFail(id: number) {
    const usuario = await this.usuarioModel.findByPk(id);

    if (!usuario) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado!`);
    }

    return usuario;
  }

  private async verificarEmailUnico(email: string, idAtual: number) {
    const usuarioExistente = await this.usuarioModel.findOne({
      where: { email },
    });

    if (usuarioExistente && usuarioExistente.id !== idAtual) {
      throw new ConflictException('Este e-mail já está em uso por outro usuário!');
    }
  }
}