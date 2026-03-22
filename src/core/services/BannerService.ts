import { Banner, CreateBannerInput } from '../entities/Banner';

export class BannerService {
  private static banners: Banner[] = [];
  private static proximoId = 1;

  static async listAll(): Promise<Banner[]> {
    return Promise.resolve(this.banners);
  }

  static async create(data: CreateBannerInput): Promise<Banner> {
    const newBanner: Banner = {
      id: this.proximoId++,
      url_imagem: data.url_imagem,
      descricao: data.descricao,
      ativo: data.ativo,
    };
    this.banners.push(newBanner);
    return Promise.resolve(newBanner);
  }

  static async update(
    id: number,
    data: Partial<CreateBannerInput>,
  ): Promise<Banner> {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Banner não encontrado');
    }

    this.banners[index] = { ...this.banners[index], ...data };
    return Promise.resolve(this.banners[index]);
  }

  static async delete(id: number): Promise<void> {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Banner não encontrado');
    }
    this.banners.splice(index, 1);
    return Promise.resolve();
  }
}
