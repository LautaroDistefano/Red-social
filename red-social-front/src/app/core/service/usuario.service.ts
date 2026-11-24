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

    listar() {
        return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
    }

    crear(formData: FormData) {
        return this.http.post<Usuario>(`${API_URL}/usuarios`, formData);
    }

    deshabilitar(id: string) {
        return this.http.delete<Usuario>(`${API_URL}/usuarios/${id}`);
    }

    habilitar(id: string) {
        return this.http.post<Usuario>(`${API_URL}/usuarios/${id}/habilitar`, {});
    }

}