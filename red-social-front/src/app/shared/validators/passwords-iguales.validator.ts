import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsIguales(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetir = control.get('repetirPassword')?.value;
    return password === repetir ? null : { passwordsDistintas: true };
}