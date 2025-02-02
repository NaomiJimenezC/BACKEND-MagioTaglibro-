const mongoose = require('../db');
const { Schema } = mongoose;

/**
 * Esquema de amistad entre usuarios.
 * @typedef {Object} Friendship
 * @property {mongoose.Schema.Types.ObjectId} requester - Usuario que envió la solicitud.
 * @property {mongoose.Schema.Types.ObjectId} recipient - Usuario que recibió la solicitud.
 * @property {('pending'|'accepted'|'rejected'|'blocked')} status - Estado de la solicitud de amistad.
 * @property {string|null} [rejectionReason] - Motivo del rechazo (opcional).
 * @property {string|null} [blockReason] - Motivo del bloqueo (opcional).
 * @property {boolean} [notificationsEnabled=true] - Si el usuario desea recibir notificaciones de esta relación.
 * @property {Date} createdAt - Fecha de creación de la solicitud.
 * @property {Date} updatedAt - Fecha de la última actualización de la solicitud.
 */
const friendshipSchema = new Schema(
    {
        /** Usuario que envió la solicitud */
        requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        /** Usuario que recibió la solicitud */
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        /** Estado de la amistad */
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'blocked'],
            default: 'pending',
        },

        /** Motivo del rechazo (opcional) */
        rejectionReason: { type: String, default: null },

        /** Motivo del bloqueo (opcional) */
        blockReason: { type: String, default: null },

        /** Indica si el usuario desea recibir notificaciones de esta relación */
        notificationsEnabled: { type: Boolean, default: true },

        /** Fecha de creación de la solicitud */
        createdAt: { type: Date, default: Date.now },

        /** Fecha de la última actualización de la solicitud */
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true } // Incluye automáticamente createdAt y updatedAt
);

module.exports = mongoose.model('friendship', friendshipSchema);
