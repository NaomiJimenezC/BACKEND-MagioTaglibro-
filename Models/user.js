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
    default: () => new Date().toLocaleDateString('es-ES', {
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
    default: () => new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pendingRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  incomingRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

// Campo virtual para obtener todas las amistades del usuario (opcional si usas un modelo Friendship aparte)
userSchema.virtual('friendships', {
  ref: 'Friendship', 
  localField: '_id', 
  foreignField: 'requester', 
});

module.exports = mongoose.model('User', userSchema);
