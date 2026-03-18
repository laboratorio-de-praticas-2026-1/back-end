import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, where } from 'sequelize';
import { Blog } from 'src/models/blog.model';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';

@Injectable()
export class BuscaService {
	constructor(@InjectModel(Blog) private blogModel: typeof Blog) {}

	async buscarBlogsPorIntervaloDeData(
		dto: BuscaBlogIntervaloDto,
	): Promise<Blog[]> {
		const de = this.parseDataBr(dto.de, 'de');
		const ate = this.parseDataBr(dto.ate, 'ate');

		if (de.key > ate.key) {
			throw new BadRequestException(
				'Intervalo inválido: "de" não pode ser maior que "ate"',
			);
		}

		return await this.blogModel.findAll({
			where: where(fn('DATE', col('data_publicacao')), {
				[Op.between]: [de.ymd, ate.ymd],
			}),
		});
	}

	private parseDataBr(
		valor: string,
		campo: string,
	): { ymd: string; key: number } {
		const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (!match) {
			throw new BadRequestException(
				`Campo "${campo}" deve estar no formato DD/MM/YYYY`,
			);
		}

		const dia = Number(match[1]);
		const mes = Number(match[2]);
		const ano = Number(match[3]);

		const data = new Date(ano, mes - 1, dia, 0, 0, 0, 0);

		const isDataValida =
			data.getFullYear() === ano &&
			data.getMonth() === mes - 1 &&
			data.getDate() === dia;

		if (!isDataValida) {
			throw new BadRequestException(`Data inválida no campo "${campo}"`);
		}

		const ymd = `${String(ano).padStart(4, '0')}-${String(mes).padStart(
			2,
			'0',
		)}-${String(dia).padStart(2, '0')}`;

		return {
			ymd,
			key: ano * 10000 + mes * 100 + dia,
		};
	}
}
