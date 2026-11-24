import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../schema/comentario.schema.js';
import { Publicacion, PublicacionDocument } from '../schema/publicacion.schema.js';
import { RangoFechasDto } from '../dto/rango-fechas.dto.js';

const ZONA = 'America/Argentina/Buenos_Aires';

@Injectable()
export class EstadisticasService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
        @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    ) {}

    // Convierte "2026-11-01" en el inicio y el fin de esos días (hora argentina)
    private rango(dto: RangoFechasDto) {
        const desde = new Date(`${dto.desde}T00:00:00.000-03:00`);
        const hasta = new Date(`${dto.hasta}T23:59:59.999-03:00`);
        if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
        throw new BadRequestException('Las fechas no son válidas');
        }
        if (desde > hasta) {
        throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
        }
        return { $gte: desde, $lte: hasta };
    }

    // Cantidad de publicaciones por usuario
    publicacionesPorUsuario(dto: RangoFechasDto) {
        return this.publicacionModel.aggregate([
            { $match: { createdAt: this.rango(dto), eliminada: false } },
            { $group: { _id: '$usuario', total: { $sum: 1 } } },
            { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'autor' } },
            { $unwind: '$autor' },
            {
                $project: {
                _id: 0,
                etiqueta: { $concat: ['$autor.nombre', ' ', '$autor.apellido'] },
                total: 1,
                },
            },
            { $sort: { total: -1 } },
        ]);
    }

    // Cantidad de comentarios por día
    comentariosPorDia(dto: RangoFechasDto) {
        return this.comentarioModel.aggregate([
            { $match: { createdAt: this.rango(dto) } },
            // Se descartan los comentarios de publicaciones dadas de baja
            { $lookup: { from: 'publicacions', localField: 'publicacion', foreignField: '_id', as: 'pub' } },
            { $unwind: '$pub' },
            { $match: { 'pub.eliminada': false } },
            {
                $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
                total: { $sum: 1 },
                },
            },
            { $project: { _id: 0, etiqueta: '$_id', total: 1 } },
            { $sort: { etiqueta: 1 } },
        ]);
    }

    // Cantidad de comentarios en cada publicación (top 10)
    comentariosPorPublicacion(dto: RangoFechasDto) {
        return this.comentarioModel.aggregate([
            { $match: { createdAt: this.rango(dto) } },
            { $group: { _id: '$publicacion', total: { $sum: 1 } } },
            { $lookup: { from: 'publicacions', localField: '_id', foreignField: '_id', as: 'pub' } },
            { $unwind: '$pub' },
            { $match: { 'pub.eliminada': false } },
            { $project: { _id: 0, etiqueta: '$pub.titulo', total: 1 } },
            { $sort: { total: -1 } },
            { $limit: 10 },
        ]);
    }
}