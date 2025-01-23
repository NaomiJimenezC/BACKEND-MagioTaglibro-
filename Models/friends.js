const mongoose = require('../db');
const { Schema } = mongoose;

const friendshipSchema = new Schema(
  {
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
);

module.exports = mongoose.model('Friendship', friendshipSchema);
