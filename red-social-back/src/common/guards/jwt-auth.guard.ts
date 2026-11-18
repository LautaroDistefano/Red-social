import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface PayloadJwt {
  sub: string;          // _id del usuario
    nombreUsuario: string;
    perfil: 'usuario' | 'administrador';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwt: JwtService) {}

    async canActivate(contexto: ExecutionContext) {
        const req = contexto.switchToHttp().getRequest();
        const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
        if (tipo !== 'Bearer' || !token) {
        throw new UnauthorizedException('Token no enviado');
        }
        try {
        req.usuario = await this.jwt.verifyAsync<PayloadJwt>(token);
        } catch {
        throw new UnauthorizedException('Token inválido o vencido');
        }
        return true;
    }
}