import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/authService';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const exp = auth.expiracion();
    const vigente = !!auth.obtenerToken() && (exp === null || exp > Date.now());
    return vigente ? true : router.createUrlTree(['/login']);
};