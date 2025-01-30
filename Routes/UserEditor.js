const express = require('express');
const multer = require('multer'); // Para gestionar las imágenes
const sharp = require('sharp');  // Para limitar imágenes
const path = require('path');
const User = require('../Models/user');
const router = express.Router();

// Configuración de multer para la carga de imágenes
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'), // Carpeta donde se guardan las imágenes
    filename: (req, file, cb) => cb(null, Date.now() + '.webp'), // Guardar imágenes como .webp
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // Limitar el tamaño del archivo a 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    if (!isValid) return cb(new Error('Tipo de archivo no permitido'));
    cb(null, true);
  },
}).single('profileImage');

// Middleware para verificar si el usuario está autenticado
const verifyUser = (req, res, next) => {
  if (!req.userId) return res.status(401).json({ message: 'No autorizado' });
  next();
};

// Ruta para obtener los datos del usuario
router.get('/me', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los datos' });
  }
});

// Ruta para actualizar el nombre de usuario
router.put('/update/username', verifyUser, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.username = username;
    await user.save();
    res.json({ message: 'Nombre de usuario actualizado', username });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el nombre de usuario' });
  }
});

// Ruta para actualizar el correo electrónico
router.put('/update/email', verifyUser, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.email = email;
    await user.save();
    res.json({ message: 'Correo electrónico actualizado', email });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el correo electrónico' });
  }
});

// Ruta para actualizar la fecha de cumpleaños
router.put('/update/birthdate', verifyUser, async (req, res) => {
  try {
    const { birthDate } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.birthDate = birthDate;
    await user.save();
    res.json({ message: 'Fecha de cumpleaños actualizada', birthDate });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la fecha de cumpleaños' });
  }
});

// Ruta para actualizar la foto de perfil
router.put('/update/profile-image', verifyUser, upload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se ha subido ninguna imagen' });

    // Convertir la imagen a WebP usando sharp
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    await sharp(filePath)
      .webp()
      .toFile(filePath); // Guardar la imagen convertida

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.profileImage = `uploads/${req.file.filename}`;
    await user.save();
    
    res.json({ message: 'Foto de perfil actualizada', profileImage: user.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar la foto de perfil' });
  }
});

// Ruta para actualizar el lema
router.put('/update/motto', verifyUser, async (req, res) => {
  try {
    const { motto } = req.body; // El lema que el usuario desea actualizar
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    user.motto = motto; // Actualiza el lema del usuario
    await user.save();
    
    res.json({ message: 'Lema actualizado correctamente', motto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el lema' });
  }
});

module.exports = router;
