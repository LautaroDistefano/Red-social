import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'recortar' })
export class RecortarPipe implements PipeTransform {
  transform(texto: string | null | undefined, max = 80): string {
    if (!texto) return '';
    return texto.length > max ? texto.slice(0, max).trimEnd() + '…' : texto;
  }
}