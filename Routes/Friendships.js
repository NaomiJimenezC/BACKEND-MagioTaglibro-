const express = require('express');
const router = express.Router();
const Friend = require('../models/friends'); // Supongamos que tienes un modelo Friend
const User = require('../models/user'); // Supongamos que tienes un modelo User

// Obtener solicitudes pendientes, solicitudes entrantes, amigos y usuarios bloqueados
router.get('/friends', async (req, res) => {
  try {
    const userId = req.query.userId; // Supongamos que envías el userId como parámetro
    const user = await User.findById(userId).populate('friends pendingRequests incomingRequests blockedUsers');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      friends: user.friends,
      pendingRequests: user.pendingRequests,
      incomingRequests: user.incomingRequests,
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Enviar solicitud de amistad
router.post('/friends/request', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Agregar a la lista de solicitudes pendientes del usuario objetivo
    const friend = await User.findById(friendId);
    if (!friend) return res.status(404).json({ message: 'User not found' });

    if (!friend.incomingRequests.includes(userId)) {
      friend.incomingRequests.push(userId);
      await friend.save();
    }

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error });
  }
});

// Aceptar solicitud de amistad
router.post('/friends/accept', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(404).json({ message: 'User not found' });

    // Agregar a amigos y eliminar de solicitudes entrantes
    user.friends.push(friendId);
    friend.friends.push(userId);

    user.incomingRequests = user.incomingRequests.filter((id) => id.toString() !== friendId);
    friend.pendingRequests = friend.pendingRequests.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error });
  }
});

// Rechazar solicitud de amistad
router.post('/friends/reject', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.incomingRequests = user.incomingRequests.filter((id) => id.toString() !== friendId);
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error });
  }
});

// Bloquear un usuario
router.post('/friends/block', async (req, res) => {
  try {
    const { userId, blockId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blockedUsers.push(blockId);
    user.friends = user.friends.filter((id) => id.toString() !== blockId);
    await user.save();

    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error });
  }
});

// Desbloquear un usuario
router.post('/friends/unblock', async (req, res) => {
  try {
    const { userId, unblockId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== unblockId);
    await user.save();

    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error });
  }
});

// Eliminar un amigo
router.post('/friends/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(404).json({ message: 'User not found' });

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error });
  }
});

module.exports = router;
