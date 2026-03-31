import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Empresa } from 'src/models/empresa.model';

const tipos_empresas = ['clinica', 'vistoria', 'detran'];

@Injectable()
export class MapaService {
    constructor(
        @InjectModel(Empresa)
        private empresaModel: typeof Empresa
    ) { }

    private get defaultFiltroMapa() {
        return {
            latitude: { [Op.ne]: null },
            longitude: { [Op.ne]: null },
        };
    }

    async findAll(): Promise<Empresa[]> {
        return this.empresaModel.findAll({
            where: this.defaultFiltroMapa,
        });
    }

    async findByTipo(tipo: string): Promise<Empresa[]> {
        const tipoFormatado = tipo.toLowerCase();

        if (!tipos_empresas.includes(tipoFormatado)) {
            throw new BadRequestException(`O tipo '${tipo}' não é válido para o mapa`)
        }

        return this.empresaModel.findAll({
            where: {
                ...this.defaultFiltroMapa,
                tipo: tipoFormatado,
            },
        });
    }

    async findByCidade(cidade: string): Promise<Empresa[]> {
        return this.empresaModel.findAll({
            where: {
                ...this.defaultFiltroMapa,
                cidade: {
                    [Op.like]: `%${cidade}%`,
                },
            },
        });
    }

}