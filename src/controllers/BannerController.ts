import { Request, Response } from 'express';
import { BannerService } from '../core/services/BannerService';

export class BannerController {
  static async getAll(_req: Request, res: Response) {
    try {
      const banners = await BannerService.listAll();
      return res.status(200).json(banners);
    } catch {
      return res.status(500).json({ error: 'Erro ao listar banners' });
    }
  }

  static async post(req: Request, res: Response) {
    try {
      const { url_imagem, descricao, ativo } = req.body as {
        url_imagem: string;
        descricao: string;
        ativo: boolean;
      };

      if (url_imagem === undefined || ativo === undefined) {
        return res.status(400).json({
          error: 'url_imagem e ativo são obrigatórios',
        });
      }

      const novoBanner = await BannerService.create({
        url_imagem,
        descricao,
        ativo,
      });
      return res.status(201).json(novoBanner);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(400).json({ error: message });
    }
  }

  static async patch(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const atualizado = await BannerService.update(id, req.body);
      return res.status(200).json(atualizado);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const status = message === 'Banner não encontrado' ? 404 : 400;
      return res.status(status).json({ error: message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await BannerService.delete(id);
      return res.status(200).json({ message: 'Banner removido com sucesso' });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(404).json({ error: message });
    }
  }
};
