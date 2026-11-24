import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(contexto: ExecutionContext) {
        const usuario = contexto.switchToHttp().getRequest().usuario; // lo dejó JwtAuthGuard
        if (usuario?.perfil !== 'administrador') {
        throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
        }
        return true;
    }
}