import { Controller, Get, Param, Post, UseGuards, Delete, UseInterceptors, Body, UploadedFile } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { AutenticacionService } from '../autenticacion/autenticacion.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { opcionesImagen, subirImagen } from '../common/utils/subida-imagen.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    @Get()
    @UseGuards(AdminGuard)
    listar() {
        return this.usuariosService.listar();
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.usuariosService.buscarPorId(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
    async crear(@Body() dto: CrearUsuarioDto, @UploadedFile() imagen?: Express.Multer.File) {
        const url = (await subirImagen(imagen)) || process.env.DEFAULT_AVATAR_URL || '';
        const usuario = await this.usuariosService.crearConPassword(dto, url, dto.perfil);
        return usuario;
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    deshabilitar(@Param('id') id: string) {
        return this.usuariosService.cambiarHabilitado(id, false);
    }

    @Post(':id/habilitar')
    @UseGuards(AdminGuard)
    habilitar(@Param('id') id: string) {
        return this.usuariosService.cambiarHabilitado(id, true);
    }
}