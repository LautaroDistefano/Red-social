import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DIRECTORIO = './uploads';

export const opcionesImagen = {
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
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        return cb(new BadRequestException('El archivo debe ser una imagen (jpg, png, webp o gif)'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
};

export const urlImagen = (archivo?: Express.Multer.File) =>
    archivo ? `${process.env.BASE_URL}/uploads/${archivo.filename}` : '';