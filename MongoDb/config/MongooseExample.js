const mongoose = require('mongoose');

/**
 * Esquema de usuario para MongoDB.
 * @typedef {Object} UsuarioSchema
 * @property {string} nombre - El nombre del usuario.
 * @property {string} email - El email del usuario (requerido y único).
 * @property {number} edad - La edad del usuario.
 */

/**
 * Modelo de usuario basado en el esquema.
 * @type {import('mongoose').Model<UsuarioSchema>}
 */
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    nombre: String,
    email: { type: String, required: true, unique: true },
    edad: Number
}));

/**
 * Crea y añade un nuevo usuario a la base de datos.
 * @async
 * @param {string} nombre - El nombre del usuario.
 * @param {string} email - El email del usuario.
 * @param {number} edad - La edad del usuario.
 * @returns {Promise<UsuarioSchema>} El usuario creado y guardado.
 * @throws {Error} Si hay un error al crear el usuario.
 */
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

/**
 * Obtiene todos los usuarios de la base de datos.
 * @async
 * @returns {Promise<UsuarioSchema[]>} Array de todos los usuarios.
 * @throws {Error} Si hay un error al obtener los usuarios.
 */
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

/**
 * Obtiene un usuario por su email.
 * @async
 * @param {string} email - El email del usuario a buscar.
 * @returns {Promise<UsuarioSchema|null>} El usuario encontrado o null si no existe.
 * @throws {Error} Si hay un error al obtener el usuario.
 */
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

/**
 * Actualiza un usuario existente por su email.
 * @async
 * @param {string} email - El email del usuario a actualizar.
 * @param {Partial<UsuarioSchema>} datosActualizados - Los datos a actualizar.
 * @returns {Promise<UsuarioSchema|null>} El usuario actualizado o null si no se encuentra.
 * @throws {Error} Si hay un error al actualizar el usuario.
 */
async function actualizarUsuario(email, datosActualizados) {
    try {
        const usuarioActualizado = await Usuario.findOneAndUpdate(
            { email: email },
            datosActualizados,
            { new: true }
        );
        console.log('Usuario actualizado:', usuarioActualizado);
        return usuarioActualizado;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
}

/**
 * Elimina un usuario por su email.
 * @async
 * @param {string} email - El email del usuario a eliminar.
 * @returns {Promise<UsuarioSchema|null>} El usuario eliminado o null si no se encuentra.
 * @throws {Error} Si hay un error al eliminar el usuario.
 */
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

/**
 * Ejecuta ejemplos de operaciones CRUD.
 * @async
 * @throws {Error} Si hay un error en alguna de las operaciones CRUD.
 */
async function ejemplosCRUD() {
    try {
        await crearUsuario('Juan Pérez', 'juan@example.com', 30);
        await obtenerTodosUsuarios();
        await obtenerUsuarioPorEmail('juan@example.com');
        await actualizarUsuario('juan@example.com', { edad: 31 });
        await eliminarUsuario('juan@example.com');
    } catch (error) {
        console.error('Error en operaciones CRUD:', error);
    }
}

ejemplosCRUD();
