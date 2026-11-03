import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
    @Prop({ required: true, trim: true })
    nombre: string;

    @Prop({ required: true, trim: true })
    apellido: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    correo: string;

    @Prop({ required: true, unique: true, trim: true })
    nombreUsuario: string;

    @Prop({ required: true })
    password: string; // siempre encriptada con bcrypt

    @Prop({ required: true })
    fechaNacimiento: Date;

    @Prop({ default: '' })
    descripcion: string;

    @Prop({ default: '' })
    imagenPerfil: string; // URL de la imagen

    @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
    perfil: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);