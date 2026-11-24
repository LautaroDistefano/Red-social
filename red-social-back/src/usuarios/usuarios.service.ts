import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schema/usuarios.schema.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
    constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

    async crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
        if (await this.usuarioModel.exists({ correo: datos.correo?.toLowerCase() })) {
        throw new ConflictException('Ya existe un usuario con ese correo');
        }
        if (await this.usuarioModel.exists({ nombreUsuario: datos.nombreUsuario })) {
        throw new ConflictException('Ya existe un usuario con ese nombre de usuario');
        }
        return this.usuarioModel.create(datos);
    }

    // Para el login: trae también la contraseña encriptada
    buscarParaLogin(identificador: string) {
        return this.usuarioModel
        .findOne({ $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }] })
        .select('+password')
        .exec();
    }

    async buscarPorId(id: string): Promise<UsuarioDocument> {
        if (!isValidObjectId(id)) throw new NotFoundException('Usuario no encontrado');
        const usuario = await this.usuarioModel.findById(id).exec();
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    async crearConPassword(
        dto: {
            nombre: string; apellido: string; correo: string; nombreUsuario: string;
            password: string; repetirPassword: string; fechaNacimiento: string; descripcion?: string;
        },
        urlImagen: string,
        perfil?: 'usuario' | 'administrador',
        ) {
        if (dto.password !== dto.repetirPassword) {
            throw new BadRequestException('Las contraseñas no coinciden');
        }
        return this.crear({
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            nombreUsuario: dto.nombreUsuario,
            password: await bcrypt.hash(dto.password, 10),
            fechaNacimiento: new Date(dto.fechaNacimiento),
            descripcion: dto.descripcion ?? '',
            imagenPerfil: urlImagen,
            ...(perfil && { perfil }),
        });
    }

    listar() {
        return this.usuarioModel.find().sort({ createdAt: -1 }).exec();
    }

    async cambiarHabilitado(id: string, habilitado: boolean) {
        if (!isValidObjectId(id)) throw new NotFoundException('Usuario no encontrado');
        const usuario = await this.usuarioModel.findByIdAndUpdate(id, { habilitado }, { new: true }).exec();
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }
}