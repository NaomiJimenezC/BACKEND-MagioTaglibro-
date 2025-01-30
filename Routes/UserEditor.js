const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const User = require("../Models/user");
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + ".webp"),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
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
router.get("/:username", verifyUser, async (req, res) => {
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

// Actualizar foto de perfil
router.patch("/:username/update/profile-image", upload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se ha subido ninguna imagen" });

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    await sharp(filePath).webp().toFile(filePath);

    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { profileImage: `uploads/${req.file.filename}` },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Foto de perfil actualizada", profileImage: user.profileImage });
  } catch (err) {
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
