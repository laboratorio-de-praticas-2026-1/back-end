export interface Banner {
  id: number;
  url_imagem: string;
  descricao: string;
  ativo: boolean;
}

export interface CreateBannerInput {
  url_imagem: string;
  descricao: string;
  ativo: boolean;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;
