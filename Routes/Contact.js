const express = require('express');
const contact = require("../Models/contact.js")

const router = express.Router();

//subir el formulario de contacto

router.post("/sent", async (req, res) => {
    const { subject, email_user, email_body } = req.body;

    if (!subject || !email_user || !email_body) {
        return res.status(400).json({ message: "Todos los campos del formulario son obligatorios" });
    }

    try {
        const newContact = await Contact.create({
            subject: subject,
            email: {
                email_user: email_user,
                email_body: email_body
            }
        });

        res.status(201).json({
            message: "Formulario de contacto enviado con éxito",
            contact: newContact
        });
    } catch (error) {
        console.error("Error al crear contacto:", error);
        res.status(500).json({
            message: "Error al enviar el formulario de contacto",
            error: error.message
        });
    }
});
module.exports = router;
