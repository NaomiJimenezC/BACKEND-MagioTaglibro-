const express = require('express');
const router = express.Router();
const Friendship = require('../Models/friendship');
const User = require('../Models/user');

// Obtener todas las amistades relacionadas con el usuario
router.get('/friends', async (req, res) => {
  try {
    const userId = req.query.userId;

    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }]
    }).populate('requester recipient', 'username email');

    const response = {
      friends: friendships.filter((f) => f.status === 'accepted'),
      pendingRequests: friendships.filter((f) => f.status === 'pending' && f.requester.toString() === userId),
      incomingRequests: friendships.filter((f) => f.status === 'pending' && f.recipient.toString() === userId),
      blockedUsers: friendships.filter((f) => f.status === 'blocked'),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends data', error });
  }
});

router.post('/friends/request', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      // Verificar si ya existe una relación entre estos usuarios
      const existingFriendship = await Friendship.findOne({
        $or: [
          { requester: userId, recipient: friendId },
          { requester: friendId, recipient: userId },
        ],
      });
  
      if (existingFriendship) {
        return res.status(400).json({ message: 'Friendship already exists' });
      }
  
      // Crear una nueva solicitud
      const newFriendship = new Friendship({ requester: userId, recipient: friendId });
      await newFriendship.save();
  
      res.json({ message: 'Friend request sent' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending friend request', error });
    }
  });
  

  router.post('/friends/accept', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      // Encontrar la solicitud pendiente
      const friendship = await Friendship.findOne({
        requester: friendId,
        recipient: userId,
        status: 'pending',
      });
  
      if (!friendship) {
        return res.status(400).json({ message: 'Friend request not found' });
      }
  
      // Actualizar el estado a "accepted"
      friendship.status = 'accepted';
      await friendship.save();
  
      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      res.status(500).json({ message: 'Error accepting friend request', error });
    }
  });
  

// Rechazar solicitud de amistad
router.post('/friends/reject', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const friendship = await Friendship.findOne({
      requester: friendId,
      recipient: userId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendship.status = 'rejected';
    await friendship.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error });
  }
});

router.post('/friends/block', async (req, res) => {
    try {
      const { userId, blockId } = req.body;
  
      // Verificar si ya existe una relación
      let friendship = await Friendship.findOne({
        $or: [
          { requester: userId, recipient: blockId },
          { requester: blockId, recipient: userId },
        ],
      });
  
      if (!friendship) {
        // Crear una relación nueva si no existe
        friendship = new Friendship({ requester: userId, recipient: blockId });
      }
  
      // Actualizar el estado a "blocked"
      friendship.status = 'blocked';
      friendship.blockReason = 'Bloqueado por el usuario';
      await friendship.save();
  
      res.json({ message: 'User blocked' });
    } catch (error) {
      res.status(500).json({ message: 'Error blocking user', error });
    }
  });
  

// Desbloquear un usuario
router.post('/friends/unblock', async (req, res) => {
  try {
    const { userId, unblockId } = req.body;

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: unblockId },
        { requester: unblockId, recipient: userId },
      ],
      status: 'blocked',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    await friendship.deleteOne();

    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error });
  }
});

// Eliminar a un amigo
router.post('/friends/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body;

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

    await friendship.deleteOne();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error });
  }
});

module.exports = router;
