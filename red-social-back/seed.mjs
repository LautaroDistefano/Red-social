import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';

if (process.env.USE_PUBLIC_DNS === 'true') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

// Colecciones: "usuarios" y "publicaciones" (las mismas que crea Mongoose)
const TITULOS = [
    'Mi primer post', 'Un día de lluvia', 'Receta de alfajores', 'Recomiendo esta serie',
    'Vuelta al gimnasio', 'Fin de semana largo', 'Aprendiendo Angular', 'Café de la mañana',
    'Mi mascota hizo esto', 'Libros del mes', 'Concierto de anoche', 'Proyecto nuevo',
    'Consejos de estudio', 'Atardecer en la costa', 'Tarde de mates',
];

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const usuarios = await db.collection('usuarios').find({}, { projection: { _id: 1 } }).toArray();
    if (usuarios.length === 0) {
        throw new Error('No hay usuarios: registrá al menos uno antes de correr el seed');
    }

    const ahora = Date.now();
    const docs = TITULOS.map((titulo, i) => {
        const autor = usuarios[i % usuarios.length]._id;
        // Los que dan me gusta: una cantidad variable de usuarios existentes
        const meGusta = usuarios.slice(0, i % (usuarios.length + 1)).map((u) => u._id);
        const fecha = new Date(ahora - i * 3600 * 1000); // una hora de diferencia entre cada una

        return {
        titulo,
        mensaje: `Esta es la publicación de prueba número ${i + 1}. Texto de ejemplo para probar el listado, el orden y la paginación.`,
        imagen: '',
        usuario: autor,
        meGusta,
        cantidadMeGusta: meGusta.length,
        eliminada: false,
        createdAt: fecha,
        updatedAt: fecha,
        };
    });

    const r = await db.collection('publicacions').insertMany(docs);
    console.log(`Se crearon ${r.insertedCount} publicaciones`);
    await mongoose.disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});