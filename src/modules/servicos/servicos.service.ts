import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  async criarServico(nome: string, descricao?: string) {
    // validação
    if (!nome) {
      throw new BadRequestException('Nome é obrigatório');
    }

    // criar no banco
    const servico = await this.prisma.servico.create({
      data: {
        nome,
        descricao,
      },
    });

    return servico;
  }
}