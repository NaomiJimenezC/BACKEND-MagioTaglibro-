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

// Ruta para obtener el estado de las amistades de un usuario
router.get('/friends', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const friendships = await Friendship.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
    }).populate('requester recipient', 'username email');

    const response = {
      friends: friendships.filter((f) => f.status === 'accepted'),
      pendingRequests: friendships.filter(
        (f) => f.status === 'pending' && f.requester.toString() === user._id.toString()
      ),
      incomingRequests: friendships.filter(
        (f) => f.status === 'pending' && f.recipient.toString() === user._id.toString()
      ),
      blockedUsers: friendships.filter((f) => f.status === 'blocked'),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends data', error: error.message });
  }
});

// Ruta para enviar solicitud de amistad
router.post('/friends/request', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
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
router.post('/friends/accept', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
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
router.post('/friends/reject', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

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

// Ruta para bloquear un usuario
router.post('/friends/block', async (req, res) => {
  try {
    const { username, blockUsername } = req.body;
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

// Ruta para obtener la lista de amigos y bloqueados
router.get('/friends/list', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const friendships = await Friendship.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
    }).populate('requester recipient', 'username email');

    const friends = friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => (f.requester._id.equals(user._id) ? f.recipient : f.requester));

    const blocked = friendships
      .filter((f) => f.status === 'blocked')
      .map((f) => (f.requester._id.equals(user._id) ? f.recipient : f.requester));

    res.json({ friends, blocked });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching list', error: error.message });
  }
});

module.exports = router;
