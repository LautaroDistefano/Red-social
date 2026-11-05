import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { Publicaciones } from './features/publicaciones/publicaciones';
import { MiPerfil } from './features/mi-perfil/mi-perfil';
import { MainLayout } from './layouts/main-layout/main-layout';

// app.routes.ts
export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    {
        path: '',
        component: MainLayout,
        children: [
        { path: 'publicaciones', component: Publicaciones },
        { path: 'mi-perfil', component: MiPerfil },
        { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: 'publicaciones' },
];