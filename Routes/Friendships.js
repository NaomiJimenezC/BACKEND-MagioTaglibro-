const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Friendship = require('../Models/friendship');
const User = require('../Models/user');

// Helper function to validate user IDs
const validateUserIds = async (userId, friendId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
    throw new Error('Invalid user ID format');
  }

  const [requester, recipient] = await Promise.all([
    User.findById(userId),
    User.findById(friendId),
  ]);

  if (!requester || !recipient) {
    throw new Error('One or both users do not exist');
  }
};

// Obtener todas las amistades relacionadas con el usuario
router.get('/friends', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
    }).populate('requester recipient', 'username email');

    const response = {
      friends: friendships.filter((f) => f.status === 'accepted'),
      pendingRequests: friendships.filter((f) => f.status === 'pending' && f.requester.toString() === userId),
      incomingRequests: friendships.filter((f) => f.status === 'pending' && f.recipient.toString() === userId),
      blockedUsers: friendships.filter((f) => f.status === 'blocked'),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends data', error: error.message });
  }
});

// Solicitar amistad
router.post('/friends/request', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    await validateUserIds(userId, friendId);

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

// Aceptar solicitud de amistad
router.post('/friends/accept', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    await validateUserIds(userId, friendId);

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

// Rechazar solicitud de amistad
router.post('/friends/reject', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    await validateUserIds(userId, friendId);

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

    res.json({ message: 'Friend request rejected', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
});

// Bloquear usuario
router.post('/friends/block', async (req, res) => {
  try {
    const { userId, blockId } = req.body;
    await validateUserIds(userId, blockId);

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

module.exports = router;
