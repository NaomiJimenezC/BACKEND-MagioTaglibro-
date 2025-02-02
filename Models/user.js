/**
 * @file Modelo de datos para usuarios.
 * Este archivo define el esquema y modelo de MongoDB para almacenar los datos de los usuarios.
 */

const mongoose = require('../db');
const { Schema } = mongoose;
const validator = require('validator');

/**
 * @typedef {Object} User
 * @property {string} username - Nombre único del usuario (obligatorio).
 * @property {string} email - Correo electrónico único del usuario (obligatorio, validado).
 * @property {string} birthDate - Fecha de nacimiento del usuario en formato `dd/mm/yyyy` (opcional, por defecto la fecha actual).
 * @property {string} password - Contraseña del usuario (obligatoria, mínimo 6 caracteres).
 * @property {string} createdAt - Fecha de creación del usuario en formato `dd/mm/yyyy` (por defecto la fecha actual).
 * @property {string} profileImage - URL de la imagen de perfil del usuario (opcional, por defecto vacío).
 * @property {string} motto - Lema personal del usuario (opcional, por defecto vacío).
 */

const userSchema = new Schema({
  username: {
    type: String,
    required: true, // El nombre de usuario es obligatorio
    unique: true, // Debe ser único en la base de datos
  },
  email: {
    type: String,
    required: true, // El correo electrónico es obligatorio
    unique: true, // Debe ser único en la base de datos
    validate: {
      validator: (v) => validator.isEmail(v), // Validación con la biblioteca validator
      message: 'Correo electrónico no válido', // Mensaje en caso de error
    },
  },
  birthDate: {
    type: String,
    default: () =>
        new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }), // Fecha predeterminada en formato español (dd/mm/yyyy)
  },
  password: {
    type: String,
    required: true, // La contraseña es obligatoria
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'], // Longitud mínima requerida
  },
  createdAt: {
    type: String,
    default: () =>
        new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }), // Fecha predeterminada en formato español (dd/mm/yyyy)
  },
  profileImage: {
    type: String,
    default: '', // Valor predeterminado vacío si no se proporciona una imagen
  },
  motto: {
    type: String,
    default: '', // Valor predeterminado vacío si no se proporciona un lema
  },
});

/**
 * Campo virtual para conectar con el modelo `Friendship`.
 * Permite establecer una relación entre los usuarios y sus amistades.
 */
userSchema.virtual('friendships', {
  ref: 'friendship', // Nombre del modelo relacionado
  localField: '_id', // Campo local que conecta con el modelo Friendship
  foreignField: 'requester', // Campo en Friendship que referencia al usuario actual
});

module.exports = mongoose.model('User', userSchema);
