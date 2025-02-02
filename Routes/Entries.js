/**
 * @file Gestión de entradas (diario) de los usuarios.
 * Este archivo contiene las rutas para manejar entradas, incluyendo creación, recuperación,
 * actualización, eliminación y compartir con otros usuarios.
 */

const express = require('express');
const Entrada = require('../Models/entrie');
const User = require('../Models/user');

const router = express.Router();

/**
 * @route GET /:username
 * @description Recupera todas las entradas de un usuario específico.
 * @param {string} username - Nombre del usuario cuyas entradas se desean recuperar.
 * @returns {Object[]} Lista de entradas del usuario o un mensaje de error si el usuario no existe.
 */
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

/**
 * @route GET /:username/latest
 * @description Recupera la entrada más reciente de un usuario.
 * @param {string} username - Nombre del usuario cuyas entradas se desean recuperar.
 * @returns {Object|null} La entrada más reciente o `null` si no hay entradas.
 */
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

/**
 * @route GET /shared-entries/:username
 * @description Recupera todas las entradas compartidas con un usuario específico.
 * @param {string} username - Nombre del usuario que recibe las entradas compartidas.
 * @returns {Object[]} Lista de entradas compartidas o un mensaje de error si ocurre algún problema.
 */
router.get("/shared-entries/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const entries = await Entrada.find({
            compartido_con: username
        });
        res.json(entries);
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ message: "Error al obtener la entrada compartida", error: error.message });
    }
});

/**
 * @route GET /shared-entries/:username/:id
 * @description Recupera los datos necesarios de una entrada compartida específica.
 * @param {string} username - Nombre del usuario que recibe la entrada compartida.
 * @param {string} id - ID único de la entrada compartida.
 * @returns {Object} Detalles de la entrada compartida o un mensaje de error si no se encuentra.
 */
router.get("/shared-entries/:username/:id", async (req, res) => {
    try {
        const { username, id } = req.params;

        if (!id || !username) {
            return res.status(400).json({ message: "Parámetros inválidos" });
        }

        const entry = await Entrada.findOne({
            _id: id,
            compartido_con: username
        });

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
/**
 * @route PATCH /shared-entries/:id_entry
 * @description Actualiza la lista de usuarios con los que se comparte una entrada específica.
 * @param {string} id_entry - ID único de la entrada a actualizar.
 * @param {string[]} shared_usernames - Lista de nombres de usuario con los que se compartirá la entrada.
 * @returns {Object} Entrada actualizada o un mensaje de error si no se encuentra.
 */
router.patch("/shared-entries/:id_entry", async (req, res) => {
    try {
        const { id_entry } = req.params;
        const { shared_usernames } = req.body;

        if (!Array.isArray(shared_usernames)) {
            return res.status(400).json({ message: "Se debe compartir con al menos un usuario" });
        }

        const updatedEntry = await Entrada.findByIdAndUpdate(
            id_entry,
            { $set: { compartido_con: shared_usernames } },
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

/**
 * @route GET /:username/:id
 * @description Recupera una entrada específica de un usuario.
 * @param {string} username - Nombre del usuario autor de la entrada.
 * @param {string} id - ID único de la entrada a recuperar.
 * @returns {Object} Detalles de la entrada o un mensaje de error si no se encuentra.
 */
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

/**
 * @route PATCH /shared-entries/:id_entry/:shared_username
 * @description Comparte una entrada con un usuario específico.
 * @param {string} id_entry - ID único de la entrada a compartir.
 * @param {string} shared_username - Nombre del usuario con el que se compartirá la entrada.
 * @returns {Object} Entrada actualizada o un mensaje de error si no se encuentra.
 */
router.patch("/shared-entries/:id_entry/:shared_username", async (req, res) => {
    try {
        const { shared_username, id_entry } = req.params;

        const updatedEntry = await Entrada.findOneAndUpdate(
            { _id: id_entry },
            { $set: { compartido_con: shared_username } }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Entrada no encontrada" });
        }

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la entrada compartida", error: error.message });
    }
});

/**
 * @route POST /new
 * @description Crea una nueva entrada o actualiza una existente basada en la fecha de creación.
 * @param {string} titulo - Título de la entrada.
 * @param {string} contenido - Contenido de la entrada.
 * @param {string} autor_username - Nombre del usuario autor de la entrada.
 * @param {Date} [fecha_creacion] - Fecha de creación de la entrada (opcional).
 * @param {string[]} [compartido_con] - Lista de usuarios con los que se compartirá la entrada (opcional).
 * @returns {Object} Entrada creada o actualizada, junto con un mensaje indicando el resultado.
 */
router.post("/new", async (req, res) => {
    const { titulo, contenido, autor_username, fecha_creacion, compartido_con } = req.body;

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

/**
 * @route DELETE /delete/:id_entry
 * @description Elimina una entrada específica por su ID.
 * @param {string} id_entry - ID único de la entrada a eliminar.
 * @returns {Object} Mensaje confirmando la eliminación o un mensaje de error si no se encuentra.
 */
router.delete("/delete/:id_entry", async (req, res) => {
    const { id_entry } = req.params;

    try {
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
