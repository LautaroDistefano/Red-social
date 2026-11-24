import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { RangoFechasDto } from '../dto/rango-fechas.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard) // primero identifica (401), después exige admin (403)
export class EstadisticasController {
    constructor(private estadisticasService: EstadisticasService) {}

    @Get('publicaciones-por-usuario')
    publicacionesPorUsuario(@Query() dto: RangoFechasDto) {
        return this.estadisticasService.publicacionesPorUsuario(dto);
    }

    @Get('comentarios-por-dia')
    comentariosPorDia(@Query() dto: RangoFechasDto) {
        return this.estadisticasService.comentariosPorDia(dto);
    }

    @Get('comentarios-por-publicacion')
    comentariosPorPublicacion(@Query() dto: RangoFechasDto) {
        return this.estadisticasService.comentariosPorPublicacion(dto);
    }
}