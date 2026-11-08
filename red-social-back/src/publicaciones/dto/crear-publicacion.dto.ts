import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
    @IsString() @IsNotEmpty({ message: 'El título es obligatorio' })
    @MaxLength(100, { message: 'El título es muy largo' })
    titulo: string;

    @IsString() @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    @MaxLength(1000, { message: 'El mensaje es muy largo' })
    mensaje: string;

    // Provisorio hasta el JWT (Sprint 3)
    @IsMongoId({ message: 'El usuario no es válido' })
    usuarioId: string;
}