import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PublicidadeService {
  remove(id: number) {
    if (!id) {
      throw new NotFoundException('Publicidade não encontrada');
    }
    
    return {
      message: `Publicidade com ID ${id} removida com sucesso`,
    };
  }
}