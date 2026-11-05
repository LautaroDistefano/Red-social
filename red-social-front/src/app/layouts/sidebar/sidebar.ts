import { Component, inject } from '@angular/core';
import { TemaService } from '../../core/service/tema.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  tema = inject(TemaService)
}
