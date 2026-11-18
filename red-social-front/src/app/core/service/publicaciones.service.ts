import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../config/api';
import { ListadoPublicaciones, OrdenPublicaciones, Publicacion } from '../models/publicacion.model';

interface FiltrosListado {
    orden?: OrdenPublicaciones;
    usuario?: string;
    offset?: number;
    limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
    private http = inject(HttpClient);
    private url = `${API_URL}/publicaciones`;

    listar(filtros: FiltrosListado) {
        let params = new HttpParams();
        Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') params = params.set(clave, String(valor));
        });
        return this.http.get<ListadoPublicaciones>(this.url, { params });
    }

    crear(formData: FormData) {
        return this.http.post<Publicacion>(this.url, formData);
    }

    eliminar(id: string) {
        return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`);
    }

    darMeGusta(id: string) {
        return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, {});
    }

    quitarMeGusta(id: string) {
        return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`);
    }

    obtener(id: string) {
        return this.http.get<Publicacion>(`${this.url}/${id}`);
    }
}