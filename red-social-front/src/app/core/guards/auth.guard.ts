import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/authService';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.obtenerToken()) return router.createUrlTree(['/login']);

    return auth.autorizar().pipe(
        map(() => true),
        catchError(() => {
        auth.cerrarSesion();
        return of(router.createUrlTree(['/login']));
        }),
    );
};