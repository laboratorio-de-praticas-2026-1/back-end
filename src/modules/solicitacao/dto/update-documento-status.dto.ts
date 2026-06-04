import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { StatusValidacaoEnum } from 'src/commons/enums/status-validacao.enum';

export class UpdateDocumentoStatusDto {
  @ApiProperty({
    enum: [StatusValidacaoEnum.APROVADO, StatusValidacaoEnum.REJEITADO],
    example: StatusValidacaoEnum.APROVADO,
  })
  @IsIn([StatusValidacaoEnum.APROVADO, StatusValidacaoEnum.REJEITADO])
  status: StatusValidacaoEnum;
}
