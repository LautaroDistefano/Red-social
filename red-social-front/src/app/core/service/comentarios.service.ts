import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Comentario, ListadoComentarios } from '../models/comentario.model';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/publicaciones`;

    listar(publicacionId: string, offset: number, limit: number) {
        // limit: cuántos elementos traer como máximo en esa petición.
        // offset: cuántos elementos saltear desde el principio antes de empezar a traer.
        const params = new HttpParams().set('offset', offset).set('limit', limit);
        return this.http.get<ListadoComentarios>(`${this.base}/${publicacionId}/comentarios`, { params });
    }

    crear(publicacionId: string, texto: string) {
        return this.http.post<Comentario>(`${this.base}/${publicacionId}/comentarios`, { texto });
    }

    editar(publicacionId: string, comentarioId: string, texto: string) {
        return this.http.put<Comentario>(`${this.base}/${publicacionId}/comentarios/${comentarioId}`, { texto });
    }
}