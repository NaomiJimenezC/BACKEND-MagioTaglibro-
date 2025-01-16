
const mongoose = require('mongoose');

const uri = 'mongodb+srv://naomi_la_admin:5^URi9~d^FQ84g@cluster0.9ebei.mongodb.net/mydatabase?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error al conectar con la base de datos:', err));

module.exports = mongoose;  
