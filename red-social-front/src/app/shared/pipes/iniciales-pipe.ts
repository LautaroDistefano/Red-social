import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string | null | undefined, apellido?: string | null): string {
    const n = (nombre ?? '').trim()[0] ?? '';
    const a = (apellido ?? '').trim()[0] ?? '';
    return (n + a).toUpperCase();
  }
}