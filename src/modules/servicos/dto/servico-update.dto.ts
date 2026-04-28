import { PartialType } from '@nestjs/swagger';
import { CreateServicoDto } from './servico-create.dto';

export class UpdateServicoDto extends PartialType(CreateServicoDto) {}
