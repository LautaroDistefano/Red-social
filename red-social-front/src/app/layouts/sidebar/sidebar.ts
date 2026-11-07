import { Component, inject } from '@angular/core';
import { TemaService } from '../../core/service/tema.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/authService';

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  tema = inject(TemaService)
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.usuarioActual();

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
