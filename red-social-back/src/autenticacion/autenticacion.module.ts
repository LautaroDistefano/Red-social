import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AutenticacionController } from './autenticacion.controller.js';
import { AutenticacionService } from './autenticacion.service.js';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}