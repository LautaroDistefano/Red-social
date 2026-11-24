import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { Publicaciones } from './features/publicaciones/publicaciones';
import { MiPerfil } from './features/mi-perfil/mi-perfil';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Cargando } from './features/cargando/cargando';
import { authGuard } from './core/guards/auth.guard';
import { PublicacionDetalle } from './features/publicaciones/publicacion-detalle/publicacion-detalle';
import { AdminUsuarios } from './features/admin/usuarios/usuarios';
import { adminGuard } from './core/guards/admin.guard';
import { AdminEstadisticas } from './features/admin/estadisticas/estadisticas';

// app.routes.ts
export const routes: Routes = [
    { path: '', pathMatch: 'full', component: Cargando },
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: 'publicaciones', component: Publicaciones },
            { path: 'mi-perfil', component: MiPerfil },
            { path: 'publicaciones/:id', component: PublicacionDetalle },
            { path: 'dashboard/usuarios', component: AdminUsuarios, canActivate: [adminGuard] },
            { path: 'dashboard/estadisticas', component: AdminEstadisticas, canActivate: [adminGuard] },
        ],
    },
    { path: '**', redirectTo: '' },
];