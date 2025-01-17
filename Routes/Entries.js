import express from "express";

const router = express.Router();
const Entrada = require('../Models/entrie');

//recovery all entries
router.get("/entries", async (req, res) => {
    try {
        const entries = await Entrada.find({});
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar las entradas", error: error.message });
    }
});