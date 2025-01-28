const mongoose = require('../db');
const { Schema } = mongoose;

const contactSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    email: {
        email_user:{
            type:String,
            required:true
        },
        email_body:{
            type:String,
            required:true
        }
    },
    creation_date: {
        type: String,
        default: () => new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    },
    autor_username: {
        type: String,
        ref: 'User',
        required: true
    },
    
});

const Entrada = mongoose.model('Contact', entradaSchema);

module.exports = Entrada;
