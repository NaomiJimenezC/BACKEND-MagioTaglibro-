const mongoose = require('../db');
const { Schema } = mongoose;

const friendshipSchema = new Schema(
  {
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
);

module.exports = mongoose.model('Friendship', friendshipSchema);
