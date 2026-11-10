import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdenPublicaciones, Publicacion } from '../../core/models/publicacion.model';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';
import { mensajeDeError } from '../../shared/utils/errores';
import { PublicacionesService } from '../../core/service/publicaciones.service';
import { AuthService } from '../../core/service/authService';

interface DatosModal {
  titulo: string;
  mensaje: string;
  confirmar?: () => void; // si existe, el modal muestra Cancelar / Confirmar
}

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, PublicacionCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PublicacionesService);
  private auth = inject(AuthService);

  usuario = this.auth.usuarioActual();
  readonly limit = 5;

  items = signal<Publicacion[]>([]);
  total = signal(0);
  pagina = signal(1);
  orden = signal<OrdenPublicaciones>('fecha');
  cargando = signal(false);
  publicando = signal(false);
  modal = signal<DatosModal | null>(null);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  inputImagen = viewChild<ElementRef<HTMLInputElement>>('inputImagen');
  imagen: File | null = null;
  errorImagen = signal<string | null>(null);

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit() {
    this.cargar();
  }

  // ---------- Listado ----------
  cargar() {
    this.cargando.set(true);
    this.service
      .listar({ orden: this.orden(), offset: (this.pagina() - 1) * this.limit, limit: this.limit })
      .subscribe({
        next: (r) => {
          // Si borré la última de una página, vuelvo a la anterior
          if (r.items.length === 0 && this.pagina() > 1) {
            this.pagina.update((p) => p - 1);
            this.cargar();
            return;
          }
          this.items.set(r.items);
          this.total.set(r.total);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.mostrarError('No pudimos cargar las publicaciones', err);
        },
      });
  }

  cambiarOrden(valor: string) {
    this.orden.set(valor as OrdenPublicaciones);
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(n: number) {
    if (n < 1 || n > this.totalPaginas()) return;
    this.pagina.set(n);
    this.cargar();
  }

  // ---------- Crear ----------
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.imagen = null;
    this.errorImagen.set(null);
    if (!archivo) return;

    if (!/^image\/(jpeg|png|webp|gif)$/.test(archivo.type)) {
      this.errorImagen.set('El archivo debe ser una imagen (jpg, png, webp o gif)');
      input.value = '';
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      this.errorImagen.set('La imagen no puede superar los 5 MB');
      input.value = '';
      return;
    }
    this.imagen = archivo;
  }

  publicar() {
    if (this.form.invalid || !this.usuario) {
      this.form.markAllAsTouched();
      return;
    }

    const { titulo, mensaje } = this.form.getRawValue();
    const formData = new FormData();
    formData.append('titulo', titulo!);
    formData.append('mensaje', mensaje!);
    formData.append('usuarioId', this.usuario._id);
    if (this.imagen) formData.append('imagen', this.imagen);

    this.publicando.set(true);
    this.service.crear(formData).subscribe({
      next: () => {
        this.publicando.set(false);
        this.form.reset();
        this.imagen = null;
        const input = this.inputImagen()?.nativeElement;
        if (input) input.value = '';
        this.orden.set('fecha');
        this.pagina.set(1);
        this.cargar();
      },
      error: (err) => {
        this.publicando.set(false);
        this.mostrarError('No pudimos publicar', err);
      },
    });
  }

  // ---------- Me gusta ----------
  alternarMeGusta(pub: Publicacion) {
    if (!this.usuario) return;
    const yaLeGusta = pub.meGusta.includes(this.usuario._id);
    const peticion = yaLeGusta
      ? this.service.quitarMeGusta(pub._id, this.usuario._id)
      : this.service.darMeGusta(pub._id, this.usuario._id);

    peticion.subscribe({
      next: (actualizada) =>
        this.items.update((lista) => lista.map((p) => (p._id === actualizada._id ? actualizada : p))),
      error: (err) => this.mostrarError('No pudimos actualizar el me gusta', err),
    });
  }

  // ---------- Eliminar ----------
  pedirEliminar(pub: Publicacion) {
    this.modal.set({
      titulo: 'Eliminar publicación',
      mensaje: `¿Seguro que querés eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`,
      confirmar: () => this.eliminar(pub),
    });
  }

  private eliminar(pub: Publicacion) {
    if (!this.usuario) return;
    this.service.eliminar(pub._id, this.usuario._id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.mostrarError('No pudimos eliminar la publicación', err),
    });
  }

  // ---------- Modal ----------
  confirmarModal() {
    const accion = this.modal()?.confirmar;
    this.modal.set(null);
    accion?.();
  }

  cerrarModal() {
    this.modal.set(null);
  }

  private mostrarError(titulo: string, err: unknown) {
    this.modal.set({ titulo, mensaje: mensajeDeError(err) });
  }
}