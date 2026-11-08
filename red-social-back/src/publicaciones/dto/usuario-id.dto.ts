import { IsMongoId } from 'class-validator';

export class UsuarioIdDto {
    @IsMongoId({ message: 'El usuario no es válido' })
    usuarioId: string;
}