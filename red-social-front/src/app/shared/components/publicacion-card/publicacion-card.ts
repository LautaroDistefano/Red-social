import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Publicacion } from '../../../core/models/publicacion.model';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  usuarioId = input<string | null>(null);

  alternarMeGusta = output<Publicacion>();
  eliminar = output<Publicacion>();

  leGusta = computed(() => {
    const id = this.usuarioId();
    return !!id && this.publicacion().meGusta.includes(id);
  });

  esPropia = computed(() => this.publicacion().usuario?._id === this.usuarioId());
}