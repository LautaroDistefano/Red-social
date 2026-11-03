import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../../core/service/authService';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue() as { usuario: string; password: string })
      .subscribe({
        next: () => this.router.navigate(['/publicaciones']),
        error: (err) => {
          const msg = err.error?.message;
          this.errorMessage.set(Array.isArray(msg) ? msg.join('. ') : msg || 'Error al iniciar sesión');
          this.isLoading.set(false);
        },
      });
  }

}
