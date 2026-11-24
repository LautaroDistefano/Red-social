import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/authService';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    return auth.esAdmin() ? true : inject(Router).createUrlTree(['/publicaciones']);
};