import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) return '';
    const seg = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (seg < 60) return 'hace instantes';
    const min = Math.floor(seg / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `hace ${d} día${d === 1 ? '' : 's'}`;
    return new Date(fecha).toLocaleDateString('es-AR');
  }
}