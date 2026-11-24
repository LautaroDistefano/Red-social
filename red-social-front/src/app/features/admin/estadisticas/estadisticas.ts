import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { mensajeDeError } from '../../../shared/utils/errores';
import { EstadisticasService, Punto } from '../../../core/service/estadisticas.service';

Chart.register(...registerables);

const PALETA = ['#c8352e', '#294f5c', '#295c47', '#e0a030', '#7a5240', '#6a4c93', '#2a9d8f', '#e76f51', '#457b9d', '#8d99ae'];

// Fecha local en formato AAAA-MM-DD (lo que espera el back)
function fechaISO(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-admin-estadisticas',
  imports: [ReactiveFormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class AdminEstadisticas implements AfterViewInit, OnDestroy {
  private service = inject(EstadisticasService);

  cargando = signal(false);
  modal = signal<{ titulo: string; mensaje: string } | null>(null);
  hayDatos = signal({ usuarios: true, dias: true, pubs: true });

  rango = new FormGroup({
    desde: new FormControl(fechaISO(new Date(Date.now() - 30 * 86400000)), { nonNullable: true }),
    hasta: new FormControl(fechaISO(new Date()), { nonNullable: true }),
  });

  private cUsuarios = viewChild.required<ElementRef<HTMLCanvasElement>>('cUsuarios');
  private cDias = viewChild.required<ElementRef<HTMLCanvasElement>>('cDias');
  private cPubs = viewChild.required<ElementRef<HTMLCanvasElement>>('cPubs');
  private graficos: Record<string, Chart> = {};

  ngAfterViewInit() {
    this.consultar();
  }

  ngOnDestroy() {
    Object.values(this.graficos).forEach((g) => g.destroy());
  }

  consultar() {
    const { desde, hasta } = this.rango.getRawValue();
    if (!desde || !hasta) {
      this.modal.set({ titulo: 'Rango incompleto', mensaje: 'Elegí las dos fechas.' });
      return;
    }
    if (desde > hasta) {
      this.modal.set({ titulo: 'Rango inválido', mensaje: 'La fecha "desde" no puede ser posterior a "hasta".' });
      return;
    }

    this.cargando.set(true);
    forkJoin({
      usuarios: this.service.publicacionesPorUsuario(desde, hasta),
      dias: this.service.comentariosPorDia(desde, hasta),
      pubs: this.service.comentariosPorPublicacion(desde, hasta),
    }).subscribe({
      next: (r) => {
        this.hayDatos.set({ usuarios: r.usuarios.length > 0, dias: r.dias.length > 0, pubs: r.pubs.length > 0 });
        this.dibujar('usuarios', this.cUsuarios(), this.config('bar', r.usuarios, 'Publicaciones'));
        this.dibujar('dias', this.cDias(), this.config('line', r.dias, 'Comentarios'));
        this.dibujar('pubs', this.cPubs(), this.config('doughnut', r.pubs, 'Comentarios'));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.set({ titulo: 'No pudimos cargar las estadísticas', mensaje: mensajeDeError(err) });
      },
    });
  }

  private config(tipo: 'bar' | 'line' | 'doughnut', datos: Punto[], titulo: string): ChartConfiguration {
    const circular = tipo === 'doughnut';
    return {
      type: tipo,
      data: {
        labels: datos.map((d) => d.etiqueta),
        datasets: [
          {
            label: titulo,
            data: datos.map((d) => d.total),
            backgroundColor: circular ? PALETA : tipo === 'bar' ? PALETA[0] : 'rgba(200,53,46,0.2)',
            borderColor: PALETA[0],
            borderWidth: tipo === 'line' ? 3 : 1,
            fill: tipo === 'line',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: circular } },
        scales: circular ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    } as ChartConfiguration;
  }

  // Si ya existía el gráfico se destruye, para que no se superpongan al cambiar el rango
  private dibujar(clave: string, canvas: ElementRef<HTMLCanvasElement>, config: ChartConfiguration) {
    this.graficos[clave]?.destroy();
    this.graficos[clave] = new Chart(canvas.nativeElement, config);
  }
}