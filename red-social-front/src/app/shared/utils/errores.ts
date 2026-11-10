import { HttpErrorResponse } from '@angular/common/http';

// El back puede devolver message como string o como array (validaciones)
export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
    if (err instanceof HttpErrorResponse) {
        if (err.status === 0) return 'No se pudo conectar con el servidor';
        const msg = err.error?.message;
        if (Array.isArray(msg)) return msg.join('. ');
        if (msg) return msg;
    }
    return porDefecto;
}