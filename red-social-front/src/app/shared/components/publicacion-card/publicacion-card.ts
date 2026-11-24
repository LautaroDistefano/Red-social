import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Publicacion } from '../../../core/models/publicacion.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  usuarioId = input<string | null>(null);
  detalle = input(false);
  esAdmin = input(false);

  alternarMeGusta = output<Publicacion>();
  eliminar = output<Publicacion>();

  leGusta = computed(() => {
    const id = this.usuarioId();
    return !!id && this.publicacion().meGusta.includes(id);
  });

  esPropia = computed(() => this.publicacion().usuario?._id === this.usuarioId());
  puedeEliminar = computed(() => this.esPropia() || this.esAdmin());
}