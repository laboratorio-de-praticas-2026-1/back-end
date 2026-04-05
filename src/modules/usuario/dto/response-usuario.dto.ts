import { Expose, Transform } from 'class-transformer';
import { Usuario } from 'src/models/usuario.model';

export class ResponseUsuarioDto {
  @Expose()
  id: number;

  @Expose()
  nome: string;

  @Expose()
  email: string;

  @Expose()
  nivel: string;

  @Expose()
  @Transform(({ obj }: { obj: Usuario }) => obj.cpfCnpj ?? null)
  cpf_cnpj: string | null;

  @Expose()
  celular: string | null;

  @Expose()
  @Transform(({ obj }: { obj: Usuario }) => obj.dataCadastro)
  data_cadastro: Date;
}
