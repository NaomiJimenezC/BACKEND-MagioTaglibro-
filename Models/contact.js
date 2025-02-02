/**
 * @file Modelo de datos para el formulario de contacto.
 * Este archivo define el esquema y modelo de MongoDB para almacenar los datos enviados a través del formulario de contacto.
 */

const mongoose = require('../db');
const { Schema } = mongoose;

/**
 * @typedef {Object} Contact
 * @property {string} subject - Asunto del formulario de contacto.
 * @property {Object} email - Información del correo electrónico.
 * @property {string} email.email_user - Dirección de correo electrónico del usuario que envía el formulario.
 * @property {string} email.email_body - Cuerpo del mensaje enviado por el usuario.
 * @property {string} creation_date - Fecha de creación del formulario en formato `dd/mm/yyyy`.
 */

/**
 * Esquema para el modelo de contacto.
 * Define la estructura de los documentos almacenados en la colección `Contact`.
 */
const contactSchema = new Schema({
    subject: {
        type: String,
        required: true // El asunto es obligatorio
    },
    email: {
        email_user: {
            type: String,
            required: true // El correo electrónico del usuario es obligatorio
        },
        email_body: {
            type: String,
            required: true // El cuerpo del mensaje es obligatorio
        }
    },
    creation_date: {
        type: String,
        default: () => new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) // Fecha predeterminada en formato español (dd/mm/yyyy)
    }
});

/**
 * Modelo de MongoDB para la colección `Contact`.
 * Este modelo se utiliza para interactuar con los datos almacenados en la base de datos relacionados con los formularios de contacto.
 */
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
