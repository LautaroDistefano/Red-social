import { Injectable, signal } from '@angular/core';

type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class TemaService {
    tema = signal<Tema>(this.temaInicial());

    constructor() {
        this.aplicar(this.tema());
    }

    alternar() {
        const nuevo: Tema = this.tema() === 'claro' ? 'oscuro' : 'claro';
        this.tema.set(nuevo);
        this.aplicar(nuevo);
        localStorage.setItem('tema', nuevo);
    }

    private aplicar(tema: Tema) {
        document.documentElement.setAttribute('data-tema', tema);
    }

    private temaInicial(): Tema {
        const guardado = localStorage.getItem('tema');
        if (guardado === 'claro' || guardado === 'oscuro') return guardado;
        // Si nunca eligió, respeta la preferencia del sistema
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
    }
}