import { Controller, Delete, Param } from '@nestjs/common';
import { PublicidadeService } from './publicidade.service';

@Controller('publicidade')
export class PublicidadeController {
  constructor(private readonly publicidadeService: PublicidadeService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicidadeService.remove(Number(id));
    
  }
}
