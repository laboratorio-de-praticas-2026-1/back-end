import { Injectable } from '@nestjs/common';

@Injectable()
export class Formatters {
  constructor() {}

  fmtBRL(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  fmtDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
