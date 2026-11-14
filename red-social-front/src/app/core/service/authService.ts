import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/autenticacion`;

    usuarioActual() {
    try {
        const guardado = localStorage.getItem('usuario');
        return guardado ? JSON.parse(guardado) : null;
    } catch {
        return null;
    }
    }

    cerrarSesion() {
    localStorage.removeItem('usuario');
    }

    login(datos: { usuario: string; password: string }) {
        return this.http.post<any>(`${this.url}/login`, datos).pipe(
            tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario)))
        );
    }

    register(formData: FormData) {
        return this.http.post<any>(`${this.url}/registro`, formData);
    }
}