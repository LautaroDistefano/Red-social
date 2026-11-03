import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private url = 'http://localhost:3000/autenticacion';

    login(datos: { usuario: string; password: string }) {
        return this.http.post<any>(`${this.url}/login`, datos).pipe(
        tap((usuario) => localStorage.setItem('usuario', JSON.stringify(usuario)))
        );
    }

    register(formData: FormData) {
        return this.http.post<any>(`${this.url}/registro`, formData);
    }
}