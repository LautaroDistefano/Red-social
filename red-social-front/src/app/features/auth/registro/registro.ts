import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/service/authService';
import { fechaNoFutura } from '../../../shared/validators/fecha-no-futura';
import { passwordsIguales } from '../../../shared/validators/passwords-iguales.validator';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = this.fb.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/),
      ]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
      descripcion: ['', [Validators.maxLength(300)]],
    },
    { validators: passwordsIguales },
  );

  imagenPerfil: File | null = null;
  errorImagen = signal<string | null>(null);

  isLoading = signal(false);

  // Estado del modal (en vez de alert)
  modal = signal<{ titulo: string; mensaje: string; exito: boolean } | null>(null);

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorImagen.set(null);
    this.imagenPerfil = null;

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
    this.imagenPerfil = archivo;
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const valores = this.registroForm.getRawValue();
    Object.entries(valores).forEach(([clave, valor]) => {
      if (valor !== null && valor !== '') formData.append(clave, valor);
    });
    // El nombre debe coincidir con FileInterceptor('imagenPerfil') del back
    if (this.imagenPerfil) formData.append('imagenPerfil', this.imagenPerfil);

    this.isLoading.set(true);
    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.modal.set({
          titulo: '¡Registro exitoso!',
          mensaje: 'Tu cuenta fue creada. Ahora podés iniciar sesión.',
          exito: true,
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message;
        this.modal.set({
          titulo: 'No pudimos registrarte',
          mensaje: Array.isArray(msg) ? msg.join('. ') : msg || 'Ocurrió un error inesperado',
          exito: false,
        });
      },
    });
  }

  cerrarModal() {
    const exito = this.modal()?.exito;
    this.modal.set(null);
    if (exito) this.router.navigate(['/login']);
  }
}