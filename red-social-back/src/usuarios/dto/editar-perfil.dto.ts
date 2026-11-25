import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class EditarPerfilDto {
    @Transform(recortar)
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @MaxLength(50, { message: 'El nombre es muy largo' })
    nombre: string;

    @Transform(recortar)
    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    @MaxLength(300, { message: 'La descripción no puede superar los 300 caracteres' })
    descripcion?: string;
}