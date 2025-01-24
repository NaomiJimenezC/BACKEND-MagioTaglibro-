const express = require('express');
const Entrada = require('../Models/entrie');
const User = require('../Models/user');

const router = express.Router();


//Recuperar todas las entradas del usuario
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const usuarioExistente = await User.findOne({ userName: username });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        const entries = await Entrada.find({ autor_username: username });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar las entradas", error: error.message });
    }
});

// Recuperar la entrada más reciente
router.get("/:username/latest", async (req, res) => {
    try {
        const { username } = req.params;

        // Verificar si el usuario existe
        const autorEntrada = await User.findOne({ userName: username });
        if (!autorEntrada) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        // Recuperar la entrada más reciente ordenando por fecha de creación
        const latestEntry = await Entrada.findOne({ autor_username: username })
            .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
            .limit(1);

        // Manejar caso de no existencia de entradas
        if (!latestEntry) {
            return res.status(404).json({ message: "No hay entradas para este usuario" });
        }

        res.json(latestEntry);
    } catch (error) {
        res.status(500).json({
            message: "Error al recuperar la última entrada",
            error: error.message
        });
    }
});


//recuperar la entrada

router.get("/:username/:id", async (req, res) => {
    try {
        const { username, id } = req.params;
        const entrada = await Entrada.findOne({ _id: id, autor_username: username });

        if (!entrada) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.json(entrada);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "ID de entrada inválido" });
        }
        res.status(500).json({ message: "Error al recuperar la entrada", error: error.message });
    }
});

router.post("/new", async (req, res) => {
    const { titulo, contenido, autor_username } = req.body;

    // Validar los datos recibidos
    if (!titulo || !contenido || !autor_username) {
        return res.status(400).json({ message: "Título, contenido y autor_username son requeridos." });
    }

    try {
        // Verificar si el autor existe
        const usuarioExistente = await User.findOne({ userName: autor_username });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        // Buscar y actualizar la entrada, o crear una nueva si no existe
        const entradaActualizada = await Entrada.findOneAndUpdate(
            { titulo, autor_username },
            { contenido },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const mensaje = entradaActualizada.isNew ? "Entrada creada" : "Entrada actualizada";
        res.status(201).json({ message: mensaje, entrada: entradaActualizada });

    } catch (error) {
        res.status(500).json({ message: "Error al guardar/actualizar la entrada", error: error.message });
    }
});


module.exports = router;
