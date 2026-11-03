import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schema/usuarios.schema.js';

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
}