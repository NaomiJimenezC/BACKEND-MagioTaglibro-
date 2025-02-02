import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileEditor = ({ user, onSave }) => {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [birthday, setBirthday] = useState(user.birthday || "");
  const [motto, setMotto] = useState(user.motto || "");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user.profileImage || "");
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

  const handleLogoutAndRedirect = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageError("El tamaño de la imagen no puede ser mayor a 2MB.");
        setProfileImage(null);
        setProfileImagePreview("");
      } else if (!file.type.startsWith('image/')) {
        setImageError("El archivo debe ser una imagen.");
        setProfileImage(null);
        setProfileImagePreview("");
      } else {
        setImageError("");
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async (field, value, url) => {
    if (value !== user[field]) {
      try {
        const response = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value })
        });

        if (!response.ok) throw new Error(`Error al actualizar ${field}`);

        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} actualizado correctamente`);
        handleLogoutAndRedirect();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleProfileImageSave = async () => {
    if (!profileImage) {
      alert("No has seleccionado ninguna imagen.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);

      // Enviar la imagen al backend con Multer y Sharp gestionando la imagen
      const response = await fetch(`https://backend-magiotaglibro.onrender.com/api/userEditor/${user.username}/update/profile-image`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error del backend: ${response.status} - ${errorMessage}`);
      }

      alert("Foto de perfil actualizada correctamente.");
      handleLogoutAndRedirect();
    } catch (error) {
      if (error.message.includes("Error del backend")) {
        alert(error.message);
      } else {
        alert(`Error al subir la imagen: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h3>Editar Perfil</h3>
      <form>
        <div>
          <label>Nombre de usuario:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button type="button" onClick={() => handleSave('username', username, `https://backend-magiotaglibro.onrender.com/api/userEditor/${user.username}/update/username`)}>Guardar nombre de usuario</button>
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" onClick={() => handleSave('email', email, `https://backend-magiotaglibro.onrender.com/api/userEditor/${user.username}/update/email`)}>Guardar correo electrónico</button>
        </div>
        <div>
          <label>Fecha de nacimiento:</label>
          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          <button type="button" onClick={() => handleSave('birthday', birthday, `https://backend-magiotaglibro.onrender.com/api/userEditor/${user.username}/update/birthdate`)}>Guardar fecha de nacimiento</button>
        </div>
        <div>
          <label>Lema:</label>
          <input type="text" value={motto} onChange={(e) => setMotto(e.target.value)} />
          <button type="button" onClick={() => handleSave('motto', motto, `https://backend-magiotaglibro.onrender.com/api/userEditor/${user.username}/update/motto`)}>Guardar lema</button>
        </div>
        <div>
          <label>Imagen de perfil:</label>
          <input type="file" accept="image/jpeg, image/png" onChange={handleImageChange} />
          {imageError && <p style={{ color: "red" }}>{imageError}</p>}
          {profileImagePreview && <div><h4>Previsualización de la imagen:</h4><img src={profileImagePreview} alt="Previsualización del perfil" style={{ width: "100px", height: "100px" }} /></div>}
          <button type="button" onClick={handleProfileImageSave}>Guardar imagen de perfil</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
