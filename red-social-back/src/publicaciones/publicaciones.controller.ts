import {
    Body, Controller, Delete, Get, Param, Post, Query,
    UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicacion.dto.js';
import { opcionesImagen, subirImagen} from '../common/utils/subida-imagen.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';
import { type PayloadJwt } from '../common/guards/jwt-auth.guard.js';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
    async crear(
        @Body() dto: CrearPublicacionDto,
        @UsuarioActual() usuario: PayloadJwt,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        const url = await subirImagen(imagen);
        return this.publicacionesService.crear(dto, usuario.sub, url);
    }

    @Get()
    listar(@Query() dto: ListarPublicacionesDto) {
        return this.publicacionesService.listar(dto);
    }

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.publicacionesService.obtener(id);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string, @UsuarioActual() usuario: PayloadJwt) {
        return this.publicacionesService.eliminar(id, usuario.sub);
    }

    @Post(':id/me-gusta')
    darMeGusta(@Param('id') id: string, @UsuarioActual() usuario: PayloadJwt) {
        return this.publicacionesService.darMeGusta(id, usuario.sub);
    }

    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') id: string, @UsuarioActual() usuario: PayloadJwt) {
        return this.publicacionesService.quitarMeGusta(id, usuario.sub);
    }
}