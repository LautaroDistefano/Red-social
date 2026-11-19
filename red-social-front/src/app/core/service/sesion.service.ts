import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './authService';

const AVISO_ANTES_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SesionService {
    private auth = inject(AuthService);
    private router = inject(Router);

    private timerAviso?: ReturnType<typeof setTimeout>;
    private timerCierre?: ReturnType<typeof setTimeout>;

    mostrarAviso = signal(false);
    mensajeAviso = signal('');

    // Programamos el aviso y el cierre según el vencimiento del token
    iniciar() {
        this.detener();
        const exp = this.auth.expiracion();
        const duracion = this.auth.duracionToken();
        if (!exp || !duracion) return;

        const ahora = Date.now();
        const aviso = exp - duracion / 3;   // cuando queda 1/3 de la vida (si son 15 minutos, se muetra a los 5min)
        const restante = exp - aviso;

        this.mensajeAviso.set(`Quedan ${this.formatear(restante)} de sesión. ¿Querés extenderla?`);
        this.timerAviso = setTimeout(() => this.mostrarAviso.set(true), Math.max(0, aviso - ahora));
        this.timerCierre = setTimeout(() => this.cerrar(), Math.max(0, exp - ahora));
    }

    private formatear(ms: number): string {
        const seg = Math.round(ms / 1000);
        if (seg >= 60) {
            const min = Math.round(seg / 60);
            return `${min} minuto${min === 1 ? '' : 's'}`;
        }
        return `${seg} segundo${seg === 1 ? '' : 's'}`;
    }

    detener() {
        clearTimeout(this.timerAviso);
        clearTimeout(this.timerCierre);
    }

    extender() {
        this.auth.refrescar().subscribe({
            next: () => {
                this.mostrarAviso.set(false);
                this.iniciar(); // reprograma con el token nuevo
        },
        error: () => this.cerrar(),
        });
    }

    cerrar() {
        this.detener();
        this.mostrarAviso.set(false);
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
    }
}