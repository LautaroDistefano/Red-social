import { AbstractControl, ValidationErrors } from '@angular/forms';

export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return new Date(control.value) > new Date() ? { fechaFutura: true } : null;
}