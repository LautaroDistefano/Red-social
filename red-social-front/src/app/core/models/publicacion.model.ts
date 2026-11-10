export interface AutorPublicacion {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil: string;
}

export interface Publicacion {
    _id: string;
    titulo: string;
    mensaje: string;
    imagen: string;
    usuario: AutorPublicacion;
    meGusta: string[];
    cantidadMeGusta: number;
    createdAt: string;
}

export interface ListadoPublicaciones {
    items: Publicacion[];
    total: number;
    offset: number;
    limit: number;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';