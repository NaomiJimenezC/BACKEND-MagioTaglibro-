/**
 * @file Gestión del formulario de contacto.
 * Este archivo contiene la ruta para enviar los datos del formulario de contacto.
 */

const express = require('express');
const Contact = require("../Models/contact.js");

const router = express.Router();

/**
 * @route POST /sent
 * @description Envía un formulario de contacto con los detalles proporcionados por el usuario.
 * @param {string} subject - Asunto del formulario de contacto.
 * @param {string} email_user - Dirección de correo electrónico del usuario que envía el formulario.
 * @param {string} email_body - Cuerpo del mensaje enviado por el usuario.
 * @returns {Object} Mensaje confirmando el éxito o un mensaje de error si ocurre algún problema.
 *
 * @example
 * // Petición JSON esperada
 * {
 *   "subject": "Consulta sobre el servicio",
 *   "email_user": "usuario@example.com",
 *   "email_body": "Tengo una duda sobre cómo funciona la plataforma."
 * }
 *
 * // Respuesta exitosa
 * {
 *   "message": "Formulario de contacto enviado con éxito",
 *   "contact": {
 *     "_id": "63f8c8f4e5a4a8d1b4e6f123",
 *     "subject": "Consulta sobre el servicio",
 *     "email": {
 *       "email_user": "usuario@example.com",
 *       "email_body": "Tengo una duda sobre cómo funciona la plataforma."
 *     },
 *     "__v": 0
 *   }
 * }
 */
router.post("/sent", async (req, res) => {
    const { subject, email_user, email_body } = req.body;

    // Validar que todos los campos estén presentes
    if (!subject || !email_user || !email_body) {
        return res.status(400).json({ message: "Todos los campos del formulario son obligatorios" });
    }

    try {
        // Crear una nueva entrada en la base de datos para el formulario de contacto
        const newContact = await Contact.create({
            subject: subject,
            email: {
                email_user: email_user,
                email_body: email_body
            }
        });

        // Responder con éxito y devolver los datos creados
        res.status(201).json({ message: "Formulario de contacto enviado con éxito", contact: newContact });
    } catch (error) {
        // Manejar errores durante la creación del formulario
        res.status(500).json({ message: "Error al enviar el formulario de contacto", error: error.message });
    }
});

module.exports = router;
