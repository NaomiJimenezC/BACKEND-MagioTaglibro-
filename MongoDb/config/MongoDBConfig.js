import mongoose from "mongoose";
require('dotenv').config();

const adminuser = process.env.MONGODB_ADMIN_USERNAME
const adminpassword = process.env.MONGODB_ADMIN_PASSWORD
const uri = `mongodb+srv://${adminuser}:${adminpassword}@magiotaglibro.w9gcf.mongodb.net/?retryWrites=true&w=majority&appName=MagioTagLibro`

export const connectToMongoDB = async ()=>{
    try {
        await mongoose.connect(uri);
        console.log('Conectado a MongoDB exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        throw error;
    }
}