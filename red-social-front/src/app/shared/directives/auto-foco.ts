import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appAutoFoco]' })
export class AutoFocoDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);
  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}