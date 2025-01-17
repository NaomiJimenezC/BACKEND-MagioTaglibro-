const express = require('express');
const Entrada = require('../Models/entrie');
const User = require('../Models/user');

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const entries = await Entrada.find({});
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar las entradas", error: error.message });
    }
});

// Crear una nueva entrada
router.post("/new", async (req, res) => {
    const { titulo, contenido, autor_id } = req.body;

    // Validar los datos recibidos
    if (!titulo || !contenido || !autor_id) {
        return res.status(400).json({ message: "Título, contenido y autor_id son requeridos." });
    }

    // Verificar si el autor existe
    try {
        const usuarioExistente = await User.findById(autor_id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        const nuevaEntrada = new Entrada({
            titulo,
            contenido,
            autor_id,  // Usar ObjectId aquí para referenciar al usuario existente
        });

        const savedEntry = await nuevaEntrada.save();
        res.status(201).json(savedEntry);

    } catch (error) {
        res.status(500).json({ message: "Error al guardar la entrada", error: error.message });
    }
});

module.exports = router;
