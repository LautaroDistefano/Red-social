import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
  private el = inject(ElementRef<HTMLElement>);

  color = input('var(--borde)', {
    alias: 'appResaltar',
    transform: (valor: string) => valor || 'var(--borde)',
  });

  @HostListener('mouseenter') entrar() {
    this.el.nativeElement.style.backgroundColor = this.color();
  }

  @HostListener('mouseleave') salir() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}