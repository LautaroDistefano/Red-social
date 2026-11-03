import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AutenticacionService {
    constructor(private usuariosService: UsuariosService) {}

    async registro(dto: RegistroDto, urlImagen: string) {
        if (dto.password !== dto.repetirPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
        }

        const passwordEncriptada = await bcrypt.hash(dto.password, 10);

        const usuario = await this.usuariosService.crear({
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        nombreUsuario: dto.nombreUsuario,
        password: passwordEncriptada,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        descripcion: dto.descripcion ?? '',
        imagenPerfil: urlImagen,
        });

        return this.sinPassword(usuario);
    }

    async login(dto: LoginDto) {
        const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);

        // Mismo mensaje en ambos casos para no revelar si el usuario existe
        const credencialesOk = usuario && (await bcrypt.compare(dto.password, usuario.password));
        if (!credencialesOk) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
        }

        return this.sinPassword(usuario);
    }

    private sinPassword(usuario: any) {
        const { password, ...resto } = usuario.toObject();
        return resto;
    }
}

