// Server.js
const express = require('express');
const authRoutes = require('./Routes/Auth');
const entriesRoutes = require('./Routes/Entries');
const friendshipRoutes = require('./Routes/Friendships')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api/entries',entriesRoutes);
app.use('/api/users', authRoutes);
app.use('/api/frienship',friendshipRoutes)

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
