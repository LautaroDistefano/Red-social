import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../config/api';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
    private http = inject(HttpClient);

    obtener(id: string) {
        return this.http.get<Usuario>(`${API_URL}/usuarios/${id}`);
    }
}