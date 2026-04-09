import { OmitType, PartialType } from '@nestjs/swagger';
import { EmpresaDto } from './empresa-response.dto';

export class ContatoUpdateDto extends PartialType(
  OmitType(EmpresaDto, ['id', 'cnpj'] as const),
) {}
