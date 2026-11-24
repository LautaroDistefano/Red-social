import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Punto {
    etiqueta: string;
    total: number;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/estadisticas`;

    private get(ruta: string, desde: string, hasta: string) {
        const params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<Punto[]>(`${this.base}/${ruta}`, { params });
    }

    publicacionesPorUsuario(desde: string, hasta: string) {
        return this.get('publicaciones-por-usuario', desde, hasta);
    }
    comentariosPorDia(desde: string, hasta: string) {
        return this.get('comentarios-por-dia', desde, hasta);
    }
    comentariosPorPublicacion(desde: string, hasta: string) {
        return this.get('comentarios-por-publicacion', desde, hasta);
    }
}