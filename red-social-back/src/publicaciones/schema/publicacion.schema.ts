import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
    @Prop({ required: true, trim: true })
    titulo: string;

    @Prop({ required: true, trim: true })
    mensaje: string;

    @Prop({ default: '' })
    imagen: string;

    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    usuario: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
    meGusta: Types.ObjectId[];

    @Prop({ default: 0 })
    cantidadMeGusta: number;

    @Prop({ default: false })
    eliminada: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);