const express = require('express');
const Entrada = require('../Models/entrie');
const User = require('../Models/user');

const router = express.Router();


//Recuperar todas las entradas del usuario
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const usuarioExistente = await User.findOne({ username: username });
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

        const autorEntrada = await User.findOne({ username: username });
        if (!autorEntrada) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        const latestEntry = await Entrada.findOne({ autor_username: username })
            .sort({ fecha_creacion: -1 }) // Ordenar por fecha de creación descendente
            .limit(1);

        if (!latestEntry) {
            return res.status(200).json(null);
        }

        res.json(latestEntry);
    } catch (error) {
        res.status(500).json({
            message: "Error al recuperar la última entrada",
            error: error.message
        });
    }
});


//recuperar todas las entradas compartidas de un usuario (hacia ese usuario)

router.get("/shared-entries/:username", async(req,res)=>{
    try {
        const {username} = req.params;

        const entries = await Entrada.find({
            compartido_con: username
        });
        res.json(entries);
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ message: "Error al obtener la entrada compartida", error: error.message });
    }
    })
;

//obtener los datos necesarios de una entrada compartida
router.get("/shared-entries/:username/:id", async(req,res)=>{
    try {
        const {username, id} = req.params;

        // Validaciones
        if (!id || !username) {
            return res.status(400).json({ message: "Parámetros inválidos" });
        }

        const entry = await Entrada.findOne({
            _id: id,
            compartido_con: username
        });

        // Manejo de entrada no encontrada
        if (!entry) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.json(entry);
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ 
            message: "Error al obtener la entrada compartida", 
            error: error.message 
        });
    }
});


//actualiza la lista de usuarios compartidos
router.patch("/shared-entries/:id_entry", async (req, res) => {
    try {
        const { id_entry } = req.params;
        const { shared_usernames } = req.body;
        console.log(shared_usernames);
        // Validamos que shared_usernames sea un array no vacío
        if (!Array.isArray(shared_usernames) || shared_usernames.length === 0) {
            return res.status(400).json({ message: "Se debe compartir con al menos un usuario" });
        }

        const updatedEntry = await Entrada.findByIdAndUpdate(
            id_entry,
            { $set: { compartido_con: shared_usernames  } },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la entrada compartida", error: error.message });
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
        if (error.kind === 'username') {
            return res.status(400).json({ message: "ID de entrada inválido" });
        }
        res.status(500).json({ message: "Error al recuperar la entrada", error: error.message });
    }
});

//compartir entrada
router.patch("/shared-entries/:id_entry/:shared_username", async (req, res) => {
    try {
        const { shared_username, id_entry } = req.params;
        console.log(shared_username)

        const updatedEntry = await Entrada.findOneAndUpdate(
            {_id : id_entry},
            { $addToSet: { compartido_con: shared_username } },
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la entrada compartida", error: error.message });
    }
});


//nueva entrada
router.post("/new", async (req, res) => {
    const { titulo, contenido, autor_username, fecha_creacion, compartido_con } = req.body;
    console.log(compartido_con);

    if (!titulo || !contenido || !autor_username) {
        return res.status(400).json({ message: "Título, contenido y autor_username son requeridos." });
    }

    try {
        const usuarioExistente = await User.findOne({ username: autor_username });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe." });
        }

        const entradaActualizada = await Entrada.findOneAndUpdate(
            { fecha_creacion },
            { 
                $set: {
                    titulo,
                    contenido,
                    autor_username,
                    compartido_con
                }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const mensaje = entradaActualizada.isNew ? "Entrada creada" : "Entrada actualizada";
        res.status(201).json({ message: mensaje, entrada: entradaActualizada });

    } catch (error) {
        res.status(500).json({ message: "Error al guardar/actualizar la entrada", error: error.message });
    }
});


router.delete("/delete/:id_entry", async (req, res) => {
    const { id_entry } = req.params;

    try {
        // Verificar si el id_entry existe
        if (!id_entry) {
            return res.status(400).json({ message: "ID de entrada no proporcionado" });
        }

        const deletedEntry = await Entrada.findByIdAndDelete(id_entry);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.status(200).json({ message: "Entrada eliminada con éxito", deletedEntry });
    } catch (error) {
        console.error("Error al borrar la entrada:", error);
        res.status(500).json({ message: "Error al borrar la entrada", error: error.message });
    }
});

module.exports = router;
