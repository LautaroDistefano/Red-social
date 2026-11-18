import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarComentariosDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(0)
    offset?: number;

    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
    limit?: number;
}