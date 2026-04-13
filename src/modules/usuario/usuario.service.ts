import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Usuario } from 'src/models/usuario.model';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
  ) {}

  async remove(id: number): Promise<{ message: string }> {
    const usuario = await this.findOneOrFail(id);
    await usuario.destroy();
    return { message: 'Usuário removido com sucesso!' };
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.findOneOrFail(id);

    if (updateUsuarioDto.email) {
      await this.verificarEmailUnico(updateUsuarioDto.email, id);
    }

    if (updateUsuarioDto.senha) {
      updateUsuarioDto.senha = await bcrypt.hash(updateUsuarioDto.senha, 10);
    }

    await usuario.update(updateUsuarioDto);

    return plainToInstance(ResponseUsuarioDto, usuario.get({ plain: true }), {
      excludeExtraneousValues: true,
    });
  }

  private async findOneOrFail(id: number) {
    const usuario = await this.usuarioModel.findByPk(id);

    if (!usuario) {
      throw new NotFoundException(`Usuário não encontrado!`);
    }

    return usuario;
  }

  private async verificarEmailUnico(email: string, idAtual: number) {
    const usuarioExistente = await this.usuarioModel.findOne({
      where: { email },
    });

    if (usuarioExistente && usuarioExistente.id !== idAtual) {
      throw new ConflictException(
        'Este e-mail já está em uso por outro usuário!',
      );
    }
  }
}
