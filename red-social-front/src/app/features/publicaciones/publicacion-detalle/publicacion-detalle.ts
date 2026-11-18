import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Publicacion } from '../../../core/models/publicacion.model';
import { Comentario } from '../../../core/models/comentario.model';
import { PublicacionCard } from '../../../shared/components/publicacion-card/publicacion-card';
import { mensajeDeError } from '../../../shared/utils/errores';
import { PublicacionesService } from '../../../core/service/publicaciones.service';
import { ComentariosService } from '../../../core/service/comentarios.service';
import { AuthService } from '../../../core/service/authService';

interface DatosModal {
  titulo: string;
  mensaje: string;
  confirmar?: () => void;
  alAceptar?: () => void;
}

@Component({
  selector: 'app-publicacion-detalle',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PublicacionCard],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);

  usuario = inject(AuthService).usuarioActual();
  readonly limit = 5;
  private id = '';

  publicacion = signal<Publicacion | null>(null);
  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  cargando = signal(true);
  cargandoMas = signal(false);
  enviando = signal(false);
  modal = signal<DatosModal | null>(null);

  nuevo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });

  editandoId = signal<string | null>(null);
  edicion = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });

  ngOnInit() {
    this.id = this.ruta.snapshot.paramMap.get('id') ?? '';
    this.publicacionesService.obtener(this.id).subscribe({
      next: (p) => {
        this.publicacion.set(p);
        this.cargarComentarios();
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.set({
          titulo: 'No pudimos cargar la publicación',
          mensaje: mensajeDeError(err),
          alAceptar: () => this.router.navigate(['/publicaciones']),
        });
      },
    });
  }

  // Acumula: pide a partir de los que ya se muestran y los agrega al final
  cargarComentarios() {
    this.cargandoMas.set(true);
    this.comentariosService.listar(this.id, this.comentarios().length, this.limit).subscribe({
      next: (r) => {
        this.comentarios.update((lista) => [...lista, ...r.items]);
        this.total.set(r.total);
        this.cargando.set(false);
        this.cargandoMas.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.cargandoMas.set(false);
        this.modal.set({ titulo: 'No pudimos cargar los comentarios', mensaje: mensajeDeError(err) });
      },
    });
  }

  hayMas() {
    return this.comentarios().length < this.total();
  }

  // ---------- Comentar ----------
  comentar() {
    const texto = this.nuevo.value.trim();
    if (!texto || this.nuevo.invalid) {
      this.nuevo.markAsTouched();
      return;
    }
    this.enviando.set(true);
    this.comentariosService.crear(this.id, texto).subscribe({
      next: (c) => {
        // El más reciente va arriba, igual que el orden del back
        this.comentarios.update((lista) => [c, ...lista]);
        this.total.update((t) => t + 1);
        this.nuevo.reset('');
        this.enviando.set(false);
      },
      error: (err) => {
        this.enviando.set(false);
        this.modal.set({ titulo: 'No pudimos comentar', mensaje: mensajeDeError(err) });
      },
    });
  }

  // ---------- Editar ----------
  esMio(c: Comentario) {
    return c.usuario._id === this.usuario?._id;
  }

  empezarEdicion(c: Comentario) {
    this.editandoId.set(c._id);
    this.edicion.setValue(c.texto);
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarEdicion(c: Comentario) {
    const texto = this.edicion.value.trim();
    if (!texto || this.edicion.invalid) {
      this.edicion.markAsTouched();
      return;
    }
    this.comentariosService.editar(this.id, c._id, texto).subscribe({
      next: (actualizado) => {
        this.comentarios.update((l) => l.map((x) => (x._id === actualizado._id ? actualizado : x)));
        this.editandoId.set(null);
      },
      error: (err) => this.modal.set({ titulo: 'No pudimos editar el comentario', mensaje: mensajeDeError(err) }),
    });
  }

  // ---------- Me gusta y eliminar de la publicación ----------
  alternarMeGusta(pub: Publicacion) {
    const yaLeGusta = pub.meGusta.includes(this.usuario._id);
    const peticion = yaLeGusta
      ? this.publicacionesService.quitarMeGusta(pub._id)
      : this.publicacionesService.darMeGusta(pub._id);
    peticion.subscribe({
      next: (actualizada) => this.publicacion.set(actualizada),
      error: (err) => this.modal.set({ titulo: 'No pudimos actualizar el me gusta', mensaje: mensajeDeError(err) }),
    });
  }

  pedirEliminar(pub: Publicacion) {
    this.modal.set({
      titulo: 'Eliminar publicación',
      mensaje: `¿Seguro que querés eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`,
      confirmar: () =>
        this.publicacionesService.eliminar(pub._id).subscribe({
          next: () => this.router.navigate(['/publicaciones']),
          error: (err) => this.modal.set({ titulo: 'No pudimos eliminar la publicación', mensaje: mensajeDeError(err) }),
        }),
    });
  }

  // ---------- Modal ----------
  confirmarModal() {
    const accion = this.modal()?.confirmar;
    this.modal.set(null);
    accion?.();
  }

  cerrarModal() {
    const alAceptar = this.modal()?.alAceptar;
    this.modal.set(null);
    alAceptar?.();
  }
}