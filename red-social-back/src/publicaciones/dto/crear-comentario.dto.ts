import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearComentarioDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'El comentario debe ser texto' })
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
    texto: string;
}