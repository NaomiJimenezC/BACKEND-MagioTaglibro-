/**
 * @file Gestión de autenticación de usuarios.
 * Este archivo contiene las rutas para registrar y autenticar usuarios.
 */

require('dotenv').config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const validator = require("validator");

const router = express.Router();

/**
 * @route POST /register
 * @description Registra un nuevo usuario en la aplicación.
 * @param {string} username - Nombre de usuario único.
 * @param {string} password - Contraseña del usuario.
 * @param {string} confirmPassword - Confirmación de la contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {Date} birthDate - Fecha de nacimiento del usuario.
 * @param {string} [motto] - Lema personal del usuario (opcional).
 * @param {string} [photo] - URL de la foto de perfil del usuario (opcional).
 * @returns {Object} Mensaje de éxito, token JWT y detalles del usuario registrado.
 */
router.post("/register", async (req, res) => {
  const { username, password, confirmPassword, email, birthDate, motto, photo } = req.body;

  if (!username || !password || !confirmPassword || !email || !birthDate) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Correo electrónico no válido" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "El correo electrónico ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      birthDate,
      password: hashedPassword,
      motto: motto || "",
      photo: photo || "",
    });

    await newUser.save();

    const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Usuario registrado con éxito",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        birthDate: newUser.birthDate,
        motto: newUser.motto,
        photo: newUser.photo,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

/**
 * @route POST /login
 * @description Autentica a un usuario existente y genera un token JWT.
 * @param {string} username - Nombre de usuario o correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Object} Mensaje de éxito, token JWT y detalles del usuario autenticado.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username y contraseña son requeridos" });
  }

  try {
    let user;
    if (validator.isEmail(username)) {
      user = await User.findOne({ email: username });
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        birthDate: user.birthDate,
        motto: user.motto,
        photo: user.photo,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
});

module.exports = router;
