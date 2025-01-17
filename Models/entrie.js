const mongoose = require('../db');
const { Schema } = mongoose;
const validator = require('validator');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: Date,
        default: Date.now
    },
    autor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    compartido_con: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    chat: {
        fecha_creacion: {
            type: Date,
            default: Date.now
        },
        mensajes: [{
            autor_id: {
                type: Schema.Types.ObjectId,
                ref: 'Usuario',
                required: true
            },
            contenido: {
                type: String,
                required: true
            },
            fecha_envio: {
                type: Date,
                default: Date.now
            }
        }]
    }
});

const Entrada = mongoose.model('Entrada', entradaSchema);

module.exports = Entrada;
