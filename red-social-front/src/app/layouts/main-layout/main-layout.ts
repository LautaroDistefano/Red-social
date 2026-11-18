import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SesionService } from '../../core/service/sesion.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  sesion = inject(SesionService);

  ngOnInit() { this.sesion.iniciar(); }
  ngOnDestroy() { this.sesion.detener(); }
}