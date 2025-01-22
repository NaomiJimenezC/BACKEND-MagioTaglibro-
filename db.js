
const mongoose = require('mongoose');
const account = process.env.MONGO_DB_ADMIN_USERNAME;
const password = process.env.MONGO_DB_ADMIN_PASSWORD;
const uri = `mongodb+srv://${account}:${password}.9ebei.mongodb.net/mydatabase?retryWrites=true&w=majority`;
mongoose.connect(uri)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error al conectar con la base de datos:', err));

module.exports = mongoose;  
