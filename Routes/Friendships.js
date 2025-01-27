const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Friendship = require('../Models/friendship');
const User = require('../Models/user');

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

// Cancel a friend request
router.post('/friends/cancel/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    await Friendship.deleteMany({
      $or: [
        { requester: userId, recipient: friendId, status: 'pending' },
        { requester: friendId, recipient: userId, status: 'pending' },
      ],
    });

    res.json({ message: 'Friend request canceled on both sides.' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling friend request', error: error.message });
  }
});

// Reject a friend request
router.post('/friends/reject/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    await Friendship.deleteMany({
      $or: [
        { requester: friendId, recipient: userId, status: 'pending' },
        { requester: userId, recipient: friendId, status: 'pending' },
      ],
    });

    res.json({ message: 'Friend request rejected and removed from both sides.' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
});

// Block a user
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
    friendship.blockReason = `Blocked by ${username}`;
    await friendship.save();

    res.json({ message: 'User blocked successfully.', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});

// Unblock a user
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
      return res.status(404).json({ message: 'No blocked relationship found.' });
    }

    await Friendship.deleteOne({ _id: friendship._id });
    res.json({ message: 'User unblocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
});

// Send a friend request
router.post('/friends/request/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;
    const [userId, friendId] = await validateUsernames(username, friendUsername);

    const isBlocked = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId, status: 'blocked' },
        { requester: friendId, recipient: userId, status: 'blocked' },
      ],
    });

    if (isBlocked) {
      return res.status(400).json({ message: 'Cannot send a friend request to a blocked user.' });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists.' });
    }

    const newFriendship = new Friendship({ requester: userId, recipient: friendId });
    await newFriendship.save();

    res.status(201).json({ message: 'Friend request sent.', friendship: newFriendship });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
});

module.exports = router;
