const mongoose = require('../db');
const { Schema } = mongoose;

const entradaSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        palabras_clave: {
            type: String,
            required: true
        },
        eventos_clave: {
            type: String,
            required: true
        },
        resumen: {
            type: String,
            required: true
        }
    },
    fecha_creacion: {
        type: String,
        default: () => new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    },
    autor_username: {
        type: String,
        ref: 'User',
        required: true
    },
    compartido_con: [{
        type: String,
        ref: 'User'
    }],
    chat: {
        fecha_creacion: {
            type: String,
            default: () => new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        },
        mensajes: [{
            autor_username: {
                type: String,
                ref: 'User',
                required: true
            },
            contenido: {
                type: String,
                required: true
            },
            type: Date,
            default: () => new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        }]
    }
});

const Entrada = mongoose.model('Entrada', entradaSchema);

module.exports = Entrada;
