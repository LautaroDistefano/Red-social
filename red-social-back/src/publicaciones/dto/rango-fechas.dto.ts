import { Matches } from 'class-validator';

export class RangoFechasDto {
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha "desde" debe tener formato AAAA-MM-DD' })
    desde: string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha "hasta" debe tener formato AAAA-MM-DD' })
    hasta: string;
}