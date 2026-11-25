import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
    @Prop({ required: true, trim: true })
    texto: string;

    @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true, index: true })
    publicacion: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    usuario: Types.ObjectId;

    @Prop({ default: false })
    modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);