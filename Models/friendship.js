const mongoose = require('../db');
const { Schema } = mongoose;

const friendshipSchema = new Schema(
  {
<<<<<<< HEAD
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que envió la solicitud
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que recibió la solicitud
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'blocked'], // Estados posibles de la amistad
      default: 'pending', 
    },
    rejectionReason: { type: String, default: null }, // Motivo del rechazo (opcional)
    blockReason: { type: String, default: null }, // Motivo del bloqueo (opcional)
    notificationsEnabled: { type: Boolean, default: true }, // Si el usuario desea recibir notificaciones de esta relación
    createdAt: { type: Date, default: Date.now }, // Fecha de creación de la solicitud
    updatedAt: { type: Date, default: Date.now }, // Fecha de la última actualización de la solicitud
  },
  { timestamps: true } // Incluye automáticamente createdAt y updatedAt
=======
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que envió la solicitud
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que la recibió
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'], // Estado de la relación
      default: 'pending',
    },
    rejectionReason: { type: String, default: null }, // Razón del rechazo (opcional)
    blockReason: { type: String, default: null }, // Razón del bloqueo (opcional)
    notificationsEnabled: { type: Boolean, default: true }, // Notificaciones activadas/desactivadas
  },
  { timestamps: true }
>>>>>>> 09cde3a3fc4110f5f46b31ef355893e076a4541a
);

module.exports = mongoose.model('Friendship', friendshipSchema);
