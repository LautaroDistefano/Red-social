import { ForbiddenException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schema/publicacion.schema.js'
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicacion.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
        private usuariosService: UsuariosService,
    ) {}

    async crear(dto: CrearPublicacionDto, imagen: string) {
        await this.usuariosService.buscarPorId(dto.usuarioId); // 404 si no existe

        const publicacion = await this.publicacionModel.create({
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        imagen,
        usuario: dto.usuarioId,
        });
        return publicacion.populate('usuario', CAMPOS_AUTOR);
    }

    async listar(dto: ListarPublicacionesDto) {
        const offset = dto.offset ?? 0;
        const limit = dto.limit ?? 10;

        const filtro: Record<string, any> = { eliminada: false };
        if (dto.usuario) filtro.usuario = dto.usuario;

        const orden: Record<string, 1 | -1> =
        dto.orden === 'meGusta'
            ? { cantidadMeGusta: -1, createdAt: -1 }
            : { createdAt: -1 };

        const [items, total] = await Promise.all([
        this.publicacionModel
            .find(filtro)                          // busca los documentos que cumplen el filtro
            .sort(orden)                           // los ordena
            .skip(offset)                          // descarta los primeros N (páginas anteriores)
            .limit(limit)                          // se queda con un máximo de N
            .populate('usuario', CAMPOS_AUTOR)     // reemplaza el id del autor por sus datos (como un JOIN)
            .exec(),                               // ejecuta la consulta y devuelve una Promise
        this.publicacionModel.countDocuments(filtro),
        ]);

        return { items, total, offset, limit };
    }

    async eliminar(id: string, usuarioId: string) {
        const publicacion = await this.buscarActiva(id);
        const usuario = await this.usuariosService.buscarPorId(usuarioId);

        const esAutor = publicacion.usuario.toString() === usuarioId;
        const esAdmin = usuario.perfil === 'administrador';
        if (!esAutor && !esAdmin) {
        throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
        }

        publicacion.eliminada = true;
        await publicacion.save();
        return { mensaje: 'Publicación eliminada correctamente' };
    }

    async darMeGusta(id: string, usuarioId: string) {
        await this.buscarActiva(id);
        await this.usuariosService.buscarPorId(usuarioId);

        // Atómico: solo actualiza si el usuario todavía no dio me gusta
        const actualizada = await this.publicacionModel
        .findOneAndUpdate(
            { _id: id, eliminada: false, meGusta: { $ne: usuarioId } },
            { $addToSet: { meGusta: usuarioId }, $inc: { cantidadMeGusta: 1 } },
            { new: true },
        )
        .populate('usuario', CAMPOS_AUTOR)
        .exec();

        if (!actualizada) throw new ConflictException('Ya le diste me gusta a esta publicación');
        return actualizada;
    }

    async quitarMeGusta(id: string, usuarioId: string) {
        await this.buscarActiva(id);
        await this.usuariosService.buscarPorId(usuarioId);

        const actualizada = await this.publicacionModel
        .findOneAndUpdate(
            { _id: id, eliminada: false, meGusta: usuarioId },
            { $pull: { meGusta: usuarioId }, $inc: { cantidadMeGusta: -1 } },
            { new: true },
        )
        .populate('usuario', CAMPOS_AUTOR)
        .exec();

        if (!actualizada) throw new ConflictException('No habías dado me gusta a esta publicación');
        return actualizada;
    }

    private async buscarActiva(id: string) {
        if (!isValidObjectId(id)) throw new NotFoundException('Publicación no encontrada');
        const publicacion = await this.publicacionModel.findOne({ _id: id, eliminada: false }).exec();
        if (!publicacion) throw new NotFoundException('Publicación no encontrada');
        return publicacion;
    }
}