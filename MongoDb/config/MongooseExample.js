const mongoose = require('mongoose');

// Definir el esquema
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    email: { type: String, required: true, unique: true },
    edad: Number
});

// Crear el modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

// CREATE - Crear y añadir un usuario
async function crearUsuario(nombre, email, edad) {
    try {
        const nuevoUsuario = new Usuario({ nombre, email, edad });
        const usuarioGuardado = await nuevoUsuario.save();
        console.log('Usuario creado:', usuarioGuardado);
        return usuarioGuardado;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
}

// READ - Obtener todos los usuarios
async function obtenerTodosUsuarios() {
    try {
        const usuarios = await Usuario.find();
        console.log('Usuarios encontrados:', usuarios);
        return usuarios;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
}

// READ - Obtener un usuario por email
async function obtenerUsuarioPorEmail(email) {
    try {
        const usuario = await Usuario.findOne({ email: email });
        console.log('Usuario encontrado:', usuario);
        return usuario;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
    }
}
/*
* mongoose nos ofrece estas opciones de queries
*
    Model.deleteMany()
    Model.deleteOne()
    Model.find()
    Model.findById()
    Model.findByIdAndDelete()
    Model.findByIdAndRemove()
    Model.findByIdAndUpdate()
    Model.findOne()
    Model.findOneAndDelete()
    Model.findOneAndReplace()
    Model.findOneAndUpdate()
    Model.replaceOne()
    Model.updateMany()
    Model.updateOne()
* */

// UPDATE - Actualizar un usuario
async function actualizarUsuario(email, datosActualizados) {
    try {
        const usuarioActualizado = await Usuario.findOneAndUpdate(
            { email: email },
            datosActualizados,
            { new: true } // Devuelve el documento actualizado
        );
        console.log('Usuario actualizado:', usuarioActualizado);
        return usuarioActualizado;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
}

// DELETE - Eliminar un usuario
async function eliminarUsuario(email) {
    try {
        const usuarioEliminado = await Usuario.findOneAndDelete({ email: email });
        console.log('Usuario eliminado:', usuarioEliminado);
        return usuarioEliminado;
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
}

// Ejemplos de uso
async function ejemplosCRUD() {
    try {
        // Crear
        await crearUsuario('Juan Pérez', 'juan@example.com', 30);

        // Leer todos
        await obtenerTodosUsuarios();

        // Leer uno
        await obtenerUsuarioPorEmail('juan@example.com');

        // Actualizar
        await actualizarUsuario('juan@example.com', { edad: 31 });

        // Eliminar
        await eliminarUsuario('juan@example.com');
    } catch (error) {
        console.error('Error en operaciones CRUD:', error);
    }
}

ejemplosCRUD();
