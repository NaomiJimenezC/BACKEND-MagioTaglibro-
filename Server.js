// Server.js
const express = require('express');
const mongoose = require('./db');  
const authRoutes = require('./Routes/Auth');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api/users', authRoutes);

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
