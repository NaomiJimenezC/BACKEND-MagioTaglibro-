const express = require('express');
const Entrada = require('../Models/entrie');

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const entries = await Entrada.find({});
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar las entradas", error: error.message });
    }
});

module.exports = router;
