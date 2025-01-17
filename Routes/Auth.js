require('dotenv').config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const validator = require("validator");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { username, password, confirmPassword, email, birthDate } = req.body;

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
    });

    await newUser.save();

    // Generar token después del registro
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET, // Usando la variable desde .env
      { expiresIn: "1h" }
    );

    // Devolver la misma respuesta que en el login
    res.status(201).json({
      message: "Usuario registrado con éxito",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        birthDate: newUser.birthDate,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// Login
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
      process.env.JWT_SECRET, // Usando la variable desde .env
      { expiresIn: "1h" }
    );

    // Aquí se agregan los datos completos del usuario en la respuesta
    res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,       // Se incluye el ID del usuario
        username: user.username,
        email: user.email,
        birthDate: user.birthDate,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
});

module.exports = router;
