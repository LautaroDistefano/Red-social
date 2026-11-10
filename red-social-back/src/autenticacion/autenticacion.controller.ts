import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { opcionesImagen, subirImagen } from '../common/utils/subida-imagen.js';

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
}