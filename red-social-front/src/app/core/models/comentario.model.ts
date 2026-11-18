import { AutorPublicacion } from './publicacion.model';

export interface Comentario {
    _id: string;
    texto: string;
    usuario: AutorPublicacion;
    modificado: boolean;
    createdAt: string;
}

export interface ListadoComentarios {
    items: Comentario[];
    total: number;
    offset: number;
    limit: number;
}