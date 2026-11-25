import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Usuario } from '../../core/models/usuario.model';
import { Publicacion } from '../../core/models/publicacion.model';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';
import { mensajeDeError } from '../../shared/utils/errores';
import { AuthService } from '../../core/service/authService';
import { UsuariosService } from '../../core/service/usuario.service';
import { PublicacionesService } from '../../core/service/publicaciones.service';
import { ComentariosService } from '../../core/service/comentarios.service';
import { Comentario } from '../../core/models/comentario.model';
import { RouterLink } from '@angular/router';
import { RecortarPipe } from '../../shared/pipes/recortar-pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface DatosModal {
  titulo: string;
  mensaje: string;
  confirmar?: () => void;
}

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PublicacionCard, RouterLink, RecortarPipe, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private auth = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private fb = inject(FormBuilder)
  
  sesion = this.auth.usuarioActual();
  
  comentarios = signal<Record<string, Comentario[]>>({});
  perfil = signal<Usuario | null>(null);
  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  modal = signal<DatosModal | null>(null);
  esAdmin = this.auth.esAdmin();
  editando = signal(false);
  guardando = signal(false);

  formPerfil = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', Validators.maxLength(300)],
  });

  ngOnInit() {
    if (!this.sesion) {
      this.cargando.set(false);
      this.modal.set({ titulo: 'Sin sesión', mensaje: 'Iniciá sesión para ver tu perfil.' });
      return;
    }
    this.cargar();
  }

  private cargar() {
    const id = this.sesion._id;
    forkJoin({
      perfil: this.usuariosService.obtener(id),
      publicaciones: this.publicacionesService.listar({ usuario: id, limit: 3 }),
    }).subscribe({
      next: ({ perfil, publicaciones }) => {
        this.perfil.set(perfil);
        this.publicaciones.set(publicaciones.items);
        publicaciones.items.forEach((p) => this.cargarComentarios(p._id));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.set({ titulo: 'No pudimos cargar tu perfil', mensaje: mensajeDeError(err) });
      },
    });
  }

  private cargarComentarios(publicacionId: string) {
    this.comentariosService.listar(publicacionId, 0, 3).subscribe({
      next: (r) => this.comentarios.update((m) => ({ ...m, [publicacionId]: r.items })),
      error: () => this.comentarios.update((m) => ({ ...m, [publicacionId]: [] })),
    });
  }

  alternarMeGusta(pub: Publicacion) {
    const yaLeGusta = pub.meGusta.includes(this.sesion._id);
    const peticion = yaLeGusta
      ? this.publicacionesService.quitarMeGusta(pub._id)
      : this.publicacionesService.darMeGusta(pub._id);

    peticion.subscribe({
      next: (actualizada) =>
        this.publicaciones.update((l) => l.map((p) => (p._id === actualizada._id ? actualizada : p))),
      error: (err) => this.modal.set({ titulo: 'No pudimos actualizar el me gusta', mensaje: mensajeDeError(err) }),
    });
  }

  pedirEliminar(pub: Publicacion) {
    this.modal.set({
      titulo: 'Eliminar publicación',
      mensaje: `¿Seguro que querés eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`,
      confirmar: () => this.eliminar(pub),
    });
  }

  private eliminar(pub: Publicacion) {
    this.publicacionesService.eliminar(pub._id).subscribe({
      // Recarga para que aparezca la siguiente publicación en el top 3
      next: () => this.cargar(),
      error: (err) => this.modal.set({ titulo: 'No pudimos eliminar la publicación', mensaje: mensajeDeError(err) }),
    });
  }

  confirmarModal() {
    const accion = this.modal()?.confirmar;
    this.modal.set(null);
    accion?.();
  }

  cerrarModal() {
    this.modal.set(null);
  }

  empezarEdicion() {
    const p = this.perfil();
    if (!p) return;
    this.formPerfil.setValue({ nombre: p.nombre, descripcion: p.descripcion ?? '' });
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  guardarPerfil() {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }
    const { nombre, descripcion } = this.formPerfil.getRawValue();
    this.guardando.set(true);
    this.usuariosService.editarPerfil({ nombre: nombre!.trim(), descripcion: (descripcion ?? '').trim() }).subscribe({
      next: (actualizado) => {
        this.perfil.set(actualizado);
        this.auth.actualizarUsuarioLocal({ ...this.auth.usuarioActual(), nombre: actualizado.nombre, descripcion: actualizado.descripcion });
        this.guardando.set(false);
        this.editando.set(false);
        this.modal.set({ titulo: 'Perfil actualizado', mensaje: 'Tus datos se guardaron correctamente.' });
      },
      error: (err) => {
        this.guardando.set(false);
        this.modal.set({ titulo: 'No pudimos actualizar tu perfil', mensaje: mensajeDeError(err) });
      },
    });
  }
}