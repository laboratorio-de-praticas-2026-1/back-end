import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusValidacaoEnum } from 'src/commons/enums/status-validacao.enum';

export class UpdateDocumentoStatusDto {
  @ApiProperty({
    enum: StatusValidacaoEnum,
    example: StatusValidacaoEnum.APROVADO,
  })
  @IsEnum(StatusValidacaoEnum)
  status: StatusValidacaoEnum;
}
