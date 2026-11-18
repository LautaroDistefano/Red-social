import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadJwt } from '../guards/jwt-auth.guard.js';

export const UsuarioActual = createParamDecorator(
    (_data: unknown, contexto: ExecutionContext): PayloadJwt =>
    contexto.switchToHttp().getRequest().usuario,
);