const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const User = require("../Models/user");
const { console } = require("inspector/promises");
const router = express.Router();

// Configuración de Multer para cargar imágenes
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),  // Usar extensión original
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // Limitar el tamaño a 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValid =
      allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype);
    if (!isValid) return cb(new Error("Tipo de archivo no permitido"));
    cb(null, true);
  },
}).single("profileImage");


// Obtener datos del usuario
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener los datos" });
  }
});

// Actualizar nombre de usuario
router.patch("/:username/update/username", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { username },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Nombre de usuario actualizado", username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el nombre de usuario" });
  }
});

// Actualizar correo electrónico
router.patch("/:username/update/email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { email },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Correo electrónico actualizado", email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el correo electrónico" });
  }
});

// Actualizar fecha de nacimiento
router.patch("/:username/update/birthdate", async (req, res) => {
  try {
    const { birthDate } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { birthDate },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Fecha de cumpleaños actualizada", birthDate: user.birthDate });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar la fecha de cumpleaños" });
  }
});

// Aseguramos que el directorio de cargas exista
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Ruta para actualizar la foto de perfil
router.patch("/:username/update/profile-image", upload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se ha subido ninguna imagen" });

    const inputPath = req.file.path; // Ruta original del archivo subido
    const user = await User.findOne({ username: req.params.username }); // Buscar al usuario

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Usar el ID del usuario como nombre del archivo
    const outputPath = path.join(__dirname, "../uploads", `${user._id}.webp`); // Usar el _id del usuario

    // Convertir la imagen a WebP y guardarla
    await sharp(inputPath)
      .webp({ quality: 80 })  // Establecemos calidad al 80%
      .toFile(outputPath);

    // Eliminar el archivo original después de la conversión
    fs.unlinkSync(inputPath);

    // Actualizar la ruta de la imagen de perfil en el modelo de usuario
    user.profileImage = `uploads/${path.basename(outputPath)}`;
    await user.save();

    // Devolver la nueva ruta de la imagen de perfil
    res.json({
      message: "Foto de perfil actualizada",
      profileImage: user.profileImage,  // Enviar la ruta de la nueva imagen
    });
  } catch (err) {
    console.error("Error al actualizar la imagen:", err);
    res.status(500).json({ message: "Error al actualizar la foto de perfil" });
  }
});



// Actualizar lema
router.patch("/:username/update/motto", async (req, res) => {
  try {
    const { motto } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { motto },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Lema actualizado correctamente", motto: user.motto });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el lema" });
  }
});

module.exports = router;
