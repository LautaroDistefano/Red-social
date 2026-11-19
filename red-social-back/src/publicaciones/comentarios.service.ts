import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Comentario, ComentarioDocument } from './schema/comentario.schema.js';
import { Publicacion, PublicacionDocument } from './schema/publicacion.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class ComentariosService {
    constructor(
        @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    ) {}

    async crear(publicacionId: string, usuarioId: string, dto: CrearComentarioDto) {
        await this.verificarPublicacionActiva(publicacionId);
        const comentario = await this.comentarioModel.create({
            texto: dto.texto,
            publicacion: publicacionId,
            usuario: usuarioId,
        });
        return comentario.populate('usuario', CAMPOS_AUTOR);
    }

    async listar(publicacionId: string, dto: ListarComentariosDto) {
        await this.verificarPublicacionActiva(publicacionId);
        const offset = dto.offset ?? 0;
        const limit = dto.limit ?? 5;
        const filtro = { publicacion: publicacionId };

        const [items, total] = await Promise.all([
        this.comentarioModel
            .find(filtro)
            .sort({ createdAt: -1 }) // más recientes primero
            .skip(offset)
            .limit(limit)
            .populate('usuario', CAMPOS_AUTOR)
            .exec(),
        this.comentarioModel.countDocuments(filtro),
        ]);

        return { items, total, offset, limit };
    }

    async editar(publicacionId: string, comentarioId: string, usuarioId: string, dto: CrearComentarioDto) {
        await this.verificarPublicacionActiva(publicacionId);
        if (!isValidObjectId(comentarioId)) throw new NotFoundException('Comentario no encontrado');

        const comentario = await this.comentarioModel
        .findOne({ _id: comentarioId, publicacion: publicacionId })
        .exec();
        if (!comentario) throw new NotFoundException('Comentario no encontrado');

        if (comentario.usuario.toString() !== usuarioId) {
        throw new ForbiddenException('Solo podés editar tus propios comentarios');
        }

        comentario.texto = dto.texto;
        comentario.modificado = true;
        await comentario.save();
        return comentario.populate('usuario', CAMPOS_AUTOR);
    }

    private async verificarPublicacionActiva(id: string) {
        if (!isValidObjectId(id)) throw new NotFoundException('Publicación no encontrada');
        const existe = await this.publicacionModel.exists({ _id: id, eliminada: false });
        if (!existe) throw new NotFoundException('Publicación no encontrada');
    }
}