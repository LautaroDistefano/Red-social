import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

const DIRECTORIO = './uploads';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private autenticacionService: AutenticacionService) {}

    @Post('registro')
    @UseInterceptors(
        FileInterceptor('imagenPerfil', {
        storage: diskStorage({
            destination: (req, file, cb) => {
            if (!existsSync(DIRECTORIO)) mkdirSync(DIRECTORIO, { recursive: true });
            cb(null, DIRECTORIO);
            },
            filename: (req, file, cb) => {
            const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
            cb(null, nombre);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
            return cb(new BadRequestException('El archivo debe ser una imagen (jpg, png, webp o gif)'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
        }),
    )
    registro(@Body() dto: RegistroDto, @UploadedFile() imagen?: Express.Multer.File) {
        const urlImagen = imagen ? `${process.env.BASE_URL}/uploads/${imagen.filename}` : '';
        return this.autenticacionService.registro(dto, urlImagen);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto) {
        return this.autenticacionService.login(dto);
    }
}