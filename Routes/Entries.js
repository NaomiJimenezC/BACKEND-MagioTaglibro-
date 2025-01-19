const express = require('express');
const Entrada = require('../Models/entrie');
const User = require('../Models/user');

const router = express.Router();


//Recuperar todas las entradas del usuario
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const entries = await Entrada.find({ autor_username: username });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar las entradas", error: error.message });
    }
});

//Recuperar una entrada específica
router.get("/:username/:id", async (req,res) => {
    try{ //TODO: revisar esto para corregirlo
        const {username, id} = req.params;ç
        const entries = await Entrada.find({_id: id})
    } catch(error){
        res.status(500).json({message: "Error al recuperar la entrada",error: error.message})
    }
});
// Crear una nueva entrada
router.post("/new", async (req, res) => {
    const { titulo, contenido, autor_username } = req.body;

    // Validar los datos recibidos
    if (!titulo || !contenido || !autor_username) {
        return res.status(400).json({ message: "Título, contenido y autor_username son requeridos." });
    }

    // Verificar si el autor existe
    try {
        const usuarioExistente = await User.findOne({ username: autor_username });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        const nuevaEntrada = new Entrada({
            titulo,
            contenido,
            autor_username,
        });

        const savedEntry = await nuevaEntrada.save();
        res.status(201).json(savedEntry);

    } catch (error) {
        res.status(500).json({ message: "Error al guardar la entrada", error: error.message });
    }
});


module.exports = router;
