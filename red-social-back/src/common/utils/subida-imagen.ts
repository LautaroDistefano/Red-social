import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';

export const opcionesImagen = {
    storage: memoryStorage(),
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        return cb(new BadRequestException('El archivo debe ser una imagen (jpg, png, webp o gif)'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
};

// Devuelve la URL pública (https) de la imagen, o '' si no se envió archivo
export async function subirImagen(archivo?: Express.Multer.File): Promise<string> {
    if (!archivo) return '';

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        return await new Promise<string>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: 'red-social', resource_type: 'image' }, (error, resultado) => {
            if (error || !resultado) return reject(error);
            resolve(resultado.secure_url);
            })
            .end(archivo.buffer);
        });
    } catch {
        throw new InternalServerErrorException('No se pudo subir la imagen');
    }
}