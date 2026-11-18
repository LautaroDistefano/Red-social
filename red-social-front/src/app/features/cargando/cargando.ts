import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/authService';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.auth.obtenerToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.auth.autorizar().subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: () => {
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
      },
    });
  }
}