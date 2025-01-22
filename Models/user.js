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
    type: String,
        default: () => new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
  },
  password: { 
    type: String, 
    required: true, 
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'], // Asegura longitud mínima de contraseña
  },
  createdAt: { 
    type: String,
        default: () => new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
  },
});

module.exports = mongoose.model('User', userSchema);
