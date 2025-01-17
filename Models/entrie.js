const mongoose = require('../db');
const { Schema } = mongoose;
const validator = require('validator');

const mensajeSchema = new Schema({
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
});

const chatSchema = new Schema({
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    mensajes: [mensajeSchema]
});

const entradaSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        type: String,
        required: true
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
    chat: chatSchema
});

const Entrada = mongoose.model('Entrada', entradaSchema);

module.exports = Entrada;
