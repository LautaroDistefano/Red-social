import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { Publicacion, PublicacionSchema } from './schema/publicacion.schema.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { Comentario, ComentarioSchema } from './schema/comentario.schema.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { EstadisticasController } from './estadisticas/estadisticas.controller.js';
import { EstadisticasService } from './estadisticas/estadisticas.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    UsuariosModule,
  ],
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService],
})
export class PublicacionesModule {}