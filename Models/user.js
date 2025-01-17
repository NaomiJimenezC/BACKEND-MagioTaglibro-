const mongoose = require('../db');
const { Schema } = mongoose;
const validator = require('validator'); // Para validar el correo electrónico

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,  // Asegura que el username sea único
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,  // Asegura que el correo sea único
    validate: {
      validator: (v) => validator.isEmail(v), // Valida que el correo sea correcto
      message: 'Correo electrónico no válido',
    },
  },
  birthDate: { 
    type: Date, 
    required: true, 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'], // Asegura longitud mínima de contraseña
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
  },
});

module.exports = mongoose.model('User', userSchema);
