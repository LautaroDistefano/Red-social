import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // Solo adjuntamos el token a las peticiones del back
    if (!req.url.startsWith(environment.apiUrl)) return next(req);

    const token = localStorage.getItem('token');
    const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(peticion).pipe(
        catchError((err: HttpErrorResponse) => {
        // Un 401 en login/registro es "credenciales incorrectas", no sesión vencida
        const esAuth = req.url.endsWith('/autenticacion/login') || req.url.endsWith('/autenticacion/registro');
        if (err.status === 401 && !esAuth) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            router.navigate(['/login']);
        }
        return throwError(() => err);
        }),
    );
};