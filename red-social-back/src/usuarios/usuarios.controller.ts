import { Controller, Get, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.usuariosService.buscarPorId(id);
    }
}