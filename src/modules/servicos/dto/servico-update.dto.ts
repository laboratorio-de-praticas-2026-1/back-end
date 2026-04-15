import { PartialType } from '@nestjs/mapped-types';
import { CreateServicoDto } from './servico-create.dto';

export class UpdateServicoDto extends PartialType(CreateServicoDto) {}
