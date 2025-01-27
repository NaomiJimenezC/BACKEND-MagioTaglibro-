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

// Ruta para obtener la lista de usuarios bloqueados
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

// Ruta para rechazar solicitud de amistad
router.post('/friends/reject/:username', async (req, res) => {
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

    // Eliminar la solicitud de amistad
    await friendship.delete();

    res.json({ message: 'Friend request rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
});

// Ruta para cancelar solicitud de amistad
router.post('/friends/cancel/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    const friendship = await Friendship.findOne({
      requester: userId,
      recipient: friendId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Pending friend request not found' });
    }

    // Eliminar la solicitud de amistad
    await friendship.delete();

    res.json({ message: 'Friend request canceled and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling friend request', error: error.message });
  }
});

// Ruta para bloquear un usuario
router.post('/friends/block/:username', async (req, res) => {
  try {
    const { blockUsername } = req.body;
    const username = req.params.username;
    const [userId, blockId] = await validateUsernames(username, blockUsername);

    let friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: blockId },
        { requester: blockId, recipient: userId },
      ],
    });

    if (!friendship) {
      friendship = new Friendship({ requester: userId, recipient: blockId });
    }

    friendship.status = 'blocked';
    friendship.blockReason = 'Blocked by user';
    await friendship.save();

    res.json({ message: 'User blocked', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});

// Ruta para desbloquear un usuario
router.post('/friends/unblock/:username', async (req, res) => {
  try {
    const { blockUsername } = req.body;
    const username = req.params.username;
    const [userId, blockId] = await validateUsernames(username, blockUsername);

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: blockId },
        { requester: blockId, recipient: userId },
      ],
      status: 'blocked',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Blocked friendship not found' });
    }

    friendship.status = 'accepted';  // or 'pending' depending on how you want to handle this
    friendship.blockReason = null;  // Clear the block reason
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
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Eliminar la relación de amistad
    await friendship.delete();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});

module.exports = router;
