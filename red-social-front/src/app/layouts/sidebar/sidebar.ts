import { Component, inject } from '@angular/core';
import { TemaService } from '../../core/service/tema.service';

@Component({
  imports: [],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  tema = inject(TemaService)
}
