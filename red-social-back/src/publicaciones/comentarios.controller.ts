import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { PayloadJwt } from '../common/guards/jwt-auth.guard.js';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(JwtAuthGuard)
export class ComentariosController {
    constructor(private comentariosService: ComentariosService) {}

    @Post() // 201
    crear(
        @Param('publicacionId') publicacionId: string,
        @Body() dto: CrearComentarioDto,
        @UsuarioActual() usuario: PayloadJwt,
    ) {
        return this.comentariosService.crear(publicacionId, usuario.sub, dto);
    }

    @Get()
    listar(@Param('publicacionId') publicacionId: string, @Query() dto: ListarComentariosDto) {
        return this.comentariosService.listar(publicacionId, dto);
    }

    @Put(':comentarioId') // 200
    editar(
        @Param('publicacionId') publicacionId: string,
        @Param('comentarioId') comentarioId: string,
        @Body() dto: CrearComentarioDto,
        @UsuarioActual() usuario: PayloadJwt,
    ) {
        return this.comentariosService.editar(publicacionId, comentarioId, usuario.sub, dto);
    }
}