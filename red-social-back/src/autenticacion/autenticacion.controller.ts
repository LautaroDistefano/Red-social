import { Body, Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { opcionesImagen, subirImagen } from '../common/utils/subida-imagen.js';
import { JwtAuthGuard, type PayloadJwt } from '../common/guards/jwt-auth.guard.js';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private autenticacionService: AutenticacionService) {}

    @Post('registro')
    @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
    async registro(@Body() dto: RegistroDto, @UploadedFile() imagen?: Express.Multer.File) {
        const urlImagen = await subirImagen(imagen);
        return this.autenticacionService.registro(dto, urlImagen);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto) {
        return this.autenticacionService.login(dto);
    }

    @Post('autorizar')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    autorizar(@UsuarioActual() payload: PayloadJwt) {
    return this.autenticacionService.autorizar(payload);
    }

    @Post('refrescar')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    refrescar(@UsuarioActual() payload: PayloadJwt) {
    return this.autenticacionService.refrescar(payload);
    }
}