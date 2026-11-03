import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { Publicaciones } from './features/publicaciones/publicaciones';
import { MiPerfil } from './features/mi-perfil/mi-perfil';

// app.routes.ts
export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: 'publicaciones', component: Publicaciones },
    { path: 'mi-perfil', component: MiPerfil },
    { path: '**', redirectTo: 'login' },
];