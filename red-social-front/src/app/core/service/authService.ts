import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/autenticacion`;

    obtenerToken(): string | null {
        return localStorage.getItem('token');
    }

    usuarioActual() {
        try {
            const guardado = localStorage.getItem('usuario');
            return guardado ? JSON.parse(guardado) : null;
        } catch {
        return null;
        }
    }

    // Momento (ms) en que vence el token, leído de su payload (campo exp)
    expiracion(): number | null {
        const token = this.obtenerToken();
        if (!token) return null;
        try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.exp ? payload.exp * 1000 : null;
        } catch {
        return null;
        }
    }

    cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }

    private guardarSesion(r: { token: string; usuario: any }) {
        localStorage.setItem('token', r.token);
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
    }

    login(datos: { usuario: string; password: string }) {
        return this.http
        .post<{ token: string; usuario: any }>(`${this.url}/login`, datos)
        .pipe(tap((r) => this.guardarSesion(r)));
    }

    register(formData: FormData) {
        return this.http
        .post<{ token: string; usuario: any }>(`${this.url}/registro`, formData)
        .pipe(tap((r) => this.guardarSesion(r)));
    }

    // Valida el token contra el back y actualiza los datos del usuario
    autorizar() {
        return this.http.post<any>(`${this.url}/autorizar`, {}).pipe(
        tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario))),
        );
    }

    refrescar() {
        return this.http
        .post<{ token: string }>(`${this.url}/refrescar`, {})
        .pipe(tap((r) => localStorage.setItem('token', r.token)));
    }

    private payload(): { exp?: number; iat?: number } | null {
        const token = this.obtenerToken();
        if (!token) return null;
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }

    // Vida total del token en ms (exp - iat)
    duracionToken(): number | null {
        const p = this.payload();
        return p?.exp && p?.iat ? (p.exp - p.iat) * 1000 : null;
    }
}