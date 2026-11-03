import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RegistroDto {
    @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre: string;

    @IsString() @IsNotEmpty({ message: 'El apellido es obligatorio' })
    apellido: string;

    @IsEmail({}, { message: 'El correo no es válido' })
    correo: string;

    @IsString() @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    nombreUsuario: string;

    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
    })
    password: string;

    @IsString() @IsNotEmpty({ message: 'Debés repetir la contraseña' })
    repetirPassword: string;

    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    fechaNacimiento: string;

    @IsOptional() @IsString() @MaxLength(300, { message: 'La descripción es muy larga' })
    descripcion?: string;
}