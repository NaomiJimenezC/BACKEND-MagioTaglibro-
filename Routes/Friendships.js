const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Friendship = require('../Models/friendship');
const User = require('../Models/user');

// Helper function to validate user usernames
const validateUsernames = async (username, friendUsername) => {
  const [requester, recipient] = await Promise.all([
    User.findOne({ username: username }),
    User.findOne({ username: friendUsername }),
  ]);

  if (!requester || !recipient) {
    throw new Error('One or both users do not exist');
  }

  return [requester._id, recipient._id];
};

// Ruta para obtener la lista de amigos de un usuario
router.get('/friends/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const friendships = await Friendship.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
    }).populate('requester recipient', 'username email');

    const friends = friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => (f.requester._id.equals(user._id) ? f.recipient : f.requester));

    res.json({ friends });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends list', error: error.message });
  }
});

// Ruta para obtener las solicitudes de amistad entrantes
router.get('/friends/incoming/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const incomingRequests = await Friendship.find({
      recipient: user._id,
      status: 'pending',
    }).populate('requester', 'username email'); // Trae los datos del solicitante

    res.json({ incomingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incoming friend requests', error: error.message });
  }
});

// Ruta para obtener las solicitudes de amistad pendientes enviadas
router.get('/friends/pending/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const pendingRequests = await Friendship.find({
      requester: user._id,
      status: 'pending',
    }).populate('recipient', 'username email'); // Trae los datos del destinatario

    res.json({ pendingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending friend requests', error: error.message });
  }
});

// Ruta para obtener la lista de usuarios bloqueados (No funciona)
router.get('/friends/blocked/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const friendships = await Friendship.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: 'blocked',
    }).populate('requester recipient', 'username email');

    const blockedUsers = friendships.map((f) => (f.requester._id.equals(user._id) ? f.recipient : f.requester));

    res.json({ blockedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blocked users list', error: error.message });
  }
});

// Ruta para enviar solicitud de amistad
router.post('/friends/request/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    const newFriendship = new Friendship({ requester: userId, recipient: friendId });
    await newFriendship.save();

    res.status(201).json({ message: 'Friend request sent', friendship: newFriendship });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
});

// Ruta para aceptar solicitud de amistad
router.post('/friends/accept/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    const friendship = await Friendship.findOne({
      requester: friendId,
      recipient: userId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({ message: 'Friend request accepted', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error: error.message });
  }
});

router.post('/friends/reject/:username', async (req, res) => {
  try {
    const { friendUsername, rejectionReason } = req.body;
    const username = req.params.username;

    // Buscar usuarios por username
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la solicitud de amistad pendiente
    const friendship = await Friendship.findOne({
      requester: friend._id, // Ahora se usa el ID del usuario encontrado
      recipient: user._id,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Eliminar la solicitud de amistad
    await friendship.deleteOne();

    res.json({ message: 'Friend request rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting and deleting friend request', error: error.message });
  }
});


// Ruta para cancelar solicitud de amistad
router.post('/friends/cancel/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;

    // Buscar usuarios por username
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la solicitud de amistad pendiente
    const friendship = await Friendship.findOne({
      requester: user._id, // Ahora se usa el ID del usuario encontrado
      recipient: friend._id,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Pending friend request not found' });
    }

    // Eliminar la solicitud de amistad
    await friendship.deleteOne();

    res.json({ message: 'Friend request canceled and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling friend request', error: error.message });
  }
});

router.post('/friends/block/:username', async (req, res) => {
  try {
    console.log(req.body); // 🔹 Verificar que el frontend está enviando los datos correctamente

    const { blockUsername } = req.body;
    const username = req.params.username;

    // Buscar los _id de los usuarios en la colección User
    const user = await User.findOne({ username });
    const blockedUser = await User.findOne({ username: blockUsername });

    if (!user || !blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la amistad con los IDs obtenidos
    let friendship = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: blockedUser._id },
        { requester: blockedUser._id, recipient: user._id },
      ],
    });

    // Si ya está bloqueado, avisar en lugar de bloquear de nuevo
    if (friendship && friendship.status === 'blocked') {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    // Si no existe, crearla
    if (!friendship) {
      friendship = new Friendship({ requester: user._id, recipient: blockedUser._id });
    }

    // Bloquear la amistad
    friendship.status = 'blocked';
    await friendship.save();

    res.json({ message: 'User blocked', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});



// Ruta para desbloquear un usuario
router.post('/friends/unblock/:username', async (req, res) => {
  try {
    console.log(req.body); // 🔹 Verificar que el frontend está enviando los datos correctamente

    const { blockUsername } = req.body;
    const username = req.params.username;

    // Buscar los _id de los usuarios en la colección User
    const user = await User.findOne({ username });
    const blockedUser = await User.findOne({ username: blockUsername });

    if (!user || !blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la amistad bloqueada
    const friendship = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: blockedUser._id },
        { requester: blockedUser._id, recipient: user._id },
      ],
    });

    // Verificar si la relación está realmente bloqueada
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    if (friendship.status !== 'blocked') {
      return res.status(400).json({ message: 'Friendship is not blocked' });
    }

    // Desbloquear la amistad
    friendship.status = 'accepted'; // o 'pending' según tu lógica
    friendship.blockReason = null;
    await friendship.save();

    res.json({ message: 'User unblocked', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
});



// Ruta para eliminar amigo
router.delete('/friends/remove/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;

    // Buscar los _id de los usuarios en la colección User
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la relación de amistad con estado 'accepted'
    const friendship = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: friend._id },
        { requester: friend._id, recipient: user._id },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Eliminar la relación de amistad
    await friendship.deleteOne();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});


module.exports = router;
