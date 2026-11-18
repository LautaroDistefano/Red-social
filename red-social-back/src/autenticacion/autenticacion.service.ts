import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcryptjs';
import { PayloadJwt } from '../common/guards/jwt-auth.guard.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AutenticacionService {
    constructor(
        private usuariosService: UsuariosService,
        private jwt: JwtService,
    ) {}

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

        return this.respuestaConToken(usuario);
    }

    async login(dto: LoginDto) {
        const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);

        // Mismo mensaje en ambos casos para no revelar si el usuario existe
        const credencialesOk = usuario && (await bcrypt.compare(dto.password, usuario.password));
        if (!credencialesOk) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
        }

        return this.respuestaConToken(usuario);
    }

    // Devuelve los datos del usuario del token vigente
    async autorizar(payload: PayloadJwt) {
        const usuario = await this.usuariosService.buscarPorId(payload.sub); // 404 si ya no existe
        return this.sinPassword(usuario);
    }

    // Nuevo token con la misma payload y 15 min más
    async refrescar(payload: PayloadJwt) {
        const { sub, nombreUsuario, perfil } = payload;
        return { token: await this.jwt.signAsync({ sub, nombreUsuario, perfil }) };
    }

    private async respuestaConToken(usuario: any) {
        const payload: PayloadJwt = {
        sub: usuario._id.toString(),
        nombreUsuario: usuario.nombreUsuario,
        perfil: usuario.perfil,
        };
        return { token: await this.jwt.signAsync(payload), usuario: this.sinPassword(usuario) };
    }

    private sinPassword(usuario: any) {
        const { password, ...resto } = usuario.toObject();
        return resto;
    }

}

