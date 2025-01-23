const mongoose = require('../db');
const { Schema } = mongoose;
const validator = require('validator');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Correo electrónico no válido',
    },
  },
  birthDate: {
    type: String,
    default: () =>
      new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  createdAt: {
    type: String,
    default: () =>
      new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
});

// Campo virtual para conectar con la tabla Friendship
userSchema.virtual('friendships', {
  ref: 'Friendship', // Nombre del modelo
  localField: '_id', // ID del usuario en el esquema actual
  foreignField: 'requester', // Campo en Friendship que referencia al usuario
});

module.exports = mongoose.model('User', userSchema);
