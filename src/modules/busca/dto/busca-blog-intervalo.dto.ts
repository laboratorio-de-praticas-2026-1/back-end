import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class BuscaBlogIntervaloDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Campo "de" deve estar no formato DD/MM/YYYY',
  })
  declare de: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Campo "ate" deve estar no formato DD/MM/YYYY',
  })
  declare ate: string;
}
