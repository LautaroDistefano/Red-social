import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../core/models/usuario.model';
import { passwordsIguales } from '../../../shared/validators/passwords-iguales.validator';
import { mensajeDeError } from '../../../shared/utils/errores';
import { fechaNoFutura } from '../../../shared/validators/fecha-no-futura';
import { AuthService } from '../../../core/service/authService';
import { UsuariosService } from '../../../core/service/usuario.service';
import { ResaltarDirective } from '../../../shared/directives/resaltar';

interface DatosModal {
  titulo: string;
  mensaje: string;
  confirmar?: () => void;
}

@Component({
  selector: 'app-admin-usuarios',
  imports: [ReactiveFormsModule, ResaltarDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class AdminUsuarios implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UsuariosService);
  yo = inject(AuthService).usuarioActual();

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  creando = signal(false);
  mostrarForm = signal(false);
  modal = signal<DatosModal | null>(null);

  imagen: File | null = null;
  errorImagen = signal<string | null>(null);

  form = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
      descripcion: ['', Validators.maxLength(300)],
      perfil: ['usuario', Validators.required],
    },
    { validators: passwordsIguales },
  );

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.set({ titulo: 'No pudimos cargar los usuarios', mensaje: mensajeDeError(err) });
      },
    });
  }

  // ---------- Habilitar / deshabilitar ----------
  esHabilitado(u: Usuario) {
    return u.habilitado !== false;
  }

  pedirCambio(u: Usuario) {
    if (this.esHabilitado(u)) {
      this.modal.set({
        titulo: 'Deshabilitar usuario',
        mensaje: `¿Querés deshabilitar a ${u.nombre} ${u.apellido}? No va a poder ingresar a la aplicación.`,
        confirmar: () => this.cambiar(u),
      });
    } else {
      this.cambiar(u);
    }
  }

  private cambiar(u: Usuario) {
    const peticion = this.esHabilitado(u) ? this.service.deshabilitar(u._id) : this.service.habilitar(u._id);
    peticion.subscribe({
      next: (actualizado) =>
        this.usuarios.update((l) => l.map((x) => (x._id === actualizado._id ? { ...x, ...actualizado } : x))),
      error: (err) => this.modal.set({ titulo: 'No pudimos actualizar el usuario', mensaje: mensajeDeError(err) }),
    });
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

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => {
      if (v !== null && v !== '') formData.append(k, v);
    });
    if (this.imagen) formData.append('imagenPerfil', this.imagen);

    this.creando.set(true);
    this.service.crear(formData).subscribe({
      next: () => {
        this.creando.set(false);
        this.form.reset({ perfil: 'usuario' });
        this.imagen = null;
        this.mostrarForm.set(false);
        this.cargar();
        this.modal.set({ titulo: 'Usuario creado', mensaje: 'El usuario se creó correctamente.' });
      },
      error: (err) => {
        this.creando.set(false);
        this.modal.set({ titulo: 'No pudimos crear el usuario', mensaje: mensajeDeError(err) });
      },
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
}