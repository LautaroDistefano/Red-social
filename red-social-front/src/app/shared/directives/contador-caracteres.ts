import { Directive, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, inject, input } from '@angular/core';

@Directive({ selector: '[appContadorCaracteres]' })
export class ContadorCaracteresDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLTextAreaElement>);
  private render = inject(Renderer2);
  max = input(500, { alias: 'appContadorCaracteres' });
  private contador!: HTMLElement;

  ngOnInit() {
    this.contador = this.render.createElement('small');
    this.render.setStyle(this.contador, 'color', 'var(--texto-suave)');
    this.render.setStyle(this.contador, 'text-align', 'right');
    this.render.insertBefore(
      this.el.nativeElement.parentNode,
      this.contador,
      this.el.nativeElement.nextSibling,
    );
    this.actualizar();
  }

  @HostListener('input') actualizar() {
    const restantes = this.max() - this.el.nativeElement.value.length;
    this.contador.textContent = `${restantes} caracteres restantes`;
  }

  ngOnDestroy() {
    // Angular no conoce este nodo, así que hay que quitarlo a mano
    this.contador?.remove();
  }
}