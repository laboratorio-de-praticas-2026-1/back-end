import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Usuario } from 'src/models/usuario.model';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { plainToInstance } from 'class-transformer';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    const emailExistente = await this.usuarioModel.findOne({
      where: { email: dto.email },
    });

    if (emailExistente) {
      throw new ConflictException('Esse e-mail já está cadastrado no sistema.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      const usuario = await this.usuarioModel.create({
        nome: dto.nome,
        email: dto.email,
        senha: senhaHash,
        nivel: 'cliente',
        cpfCnpj: dto.cpfCnpj ?? null,
        celular: dto.celular ?? null,
      });

      return plainToInstance(ResponseUsuarioDto, usuario.toJSON(), {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async login(dto: LoginUsuarioDto): Promise<{
    message: string;
    tokenJWT: string;
    usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'nivel'>;
  }> {
    const usuario = await this.usuarioModel.findOne({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const tokenJWT = this.jwtService.sign(
      { id: usuario.id, nivel: usuario.nivel },
      {
        expiresIn: '1d',
      },
    );

    return {
      message: 'Login realizado com sucesso',
      tokenJWT,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel,
      },
    };
  }

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

  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuarios = await this.usuarioModel.findAll({
      attributes: { exclude: ['senha'] },
    });

    const plainUsuarios = usuarios.map(
      (u) => u.get({ plain: true }) as Usuario,
    );

    return plainToInstance(ResponseUsuarioDto, plainUsuarios, {
      excludeExtraneousValues: true,
    });
  }
}
