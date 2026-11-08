import {
    Body, Controller, Delete, Get, Param, Post, Query,
    UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { UsuarioIdDto } from './dto/usuario-id.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicacion.dto.js';
import { opcionesImagen, urlImagen } from '../common/utils/subida-imagen.js';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen', opcionesImagen ))
    crear(@Body() dto: CrearPublicacionDto, @UploadedFile() imagen?: Express.Multer.File) {
        return this.publicacionesService.crear(dto, urlImagen(imagen));
    }

    @Get()
    listar(@Query() dto: ListarPublicacionesDto) {
        return this.publicacionesService.listar(dto);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string, @Query() { usuarioId }: UsuarioIdDto) {
        return this.publicacionesService.eliminar(id, usuarioId);
    }

    @Post(':id/me-gusta')
    darMeGusta(@Param('id') id: string, @Body() { usuarioId }: UsuarioIdDto) {
        return this.publicacionesService.darMeGusta(id, usuarioId);
    }

    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') id: string, @Query() { usuarioId }: UsuarioIdDto) {
        return this.publicacionesService.quitarMeGusta(id, usuarioId);
    }
}