/**
 * @file Gestión de relaciones de amistad entre usuarios.
 * Este archivo contiene las rutas para manejar solicitudes de amistad, aceptación, rechazo,
 * cancelación, bloqueo y eliminación de amigos.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Friendship = require('../Models/friendship');
const User = require('../Models/user');

/**
 * Valida si los nombres de usuario existen en la base de datos.
 * @async
 * @function validateUsernames
 * @param {string} username - Nombre de usuario del solicitante.
 * @param {string} friendUsername - Nombre de usuario del destinatario.
 * @returns {Promise<Array>} IDs de los usuarios solicitante y destinatario.
 * @throws {Error} Si uno o ambos usuarios no existen.
 */
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

/**
 * @route GET /friends/:username
 * @description Obtiene la lista de amigos aceptados de un usuario.
 * @param {string} username - Nombre de usuario del solicitante.
 * @returns {Object} Lista de amigos con sus datos básicos.
 */
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

/**
 * @route GET /friends/incoming/:username
 * @description Obtiene las solicitudes de amistad entrantes pendientes.
 * @param {string} username - Nombre de usuario del destinatario.
 * @returns {Object} Lista de solicitudes entrantes.
 */
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
    }).populate('requester', 'username email');

    res.json({ incomingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incoming friend requests', error: error.message });
  }
});

/**
 * @route GET /friends/pending/:username
 * @description Obtiene las solicitudes de amistad pendientes enviadas por el usuario.
 * @param {string} username - Nombre de usuario del solicitante.
 * @returns {Object} Lista de solicitudes pendientes enviadas.
 */
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
    }).populate('recipient', 'username email');

    res.json({ pendingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending friend requests', error: error.message });
  }
});

/**
 * @route POST /friends/request/:username
 * @description Envía una solicitud de amistad a otro usuario.
 * @param {string} username - Nombre de usuario del solicitante.
 * @param {string} friendUsername - Nombre de usuario del destinatario.
 * @returns {Object} Mensaje y detalles de la solicitud creada.
 */
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

/**
 * @route POST /friends/accept/:username
 * @description Acepta una solicitud de amistad pendiente.
 * @param {string} username - Nombre de usuario del destinatario que acepta la solicitud.
 * @param {string} friendUsername - Nombre del solicitante original.
 * @returns {Object} Mensaje y detalles de la relación actualizada.
 */
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

/**
 * @route POST /friends/reject/:username
 * @description Rechaza una solicitud de amistad pendiente y la elimina.
 * @param {string} username - Nombre del destinatario que rechaza la solicitud.
 * @param {string} friendUsername - Nombre del solicitante original.
 * @returns {Object} Mensaje confirmando el rechazo y eliminación.
 */
router.post('/friends/reject/:username', async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const username = req.params.username;

    // Buscar usuarios por nombre
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la solicitud pendiente
    const friendship = await Friendship.findOne({
      requester: friend._id,
      recipient: user._id,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Eliminar la solicitud
    await friendship.deleteOne();

    res.json({ message: 'Friend request rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting and deleting friend request', error: error.message });
  }
});
/**
 * @route POST /friends/cancel/:username
 * @description Cancela una solicitud de amistad enviada por el usuario.
 * @param {string} username - Nombre del usuario que cancela la solicitud.
 * @param {string} friendUsername - Nombre del destinatario de la solicitud.
 * @returns {Object} Mensaje indicando el éxito o error de la cancelación.
 */
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
      requester: user._id,
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

/**
 * @route POST /friends/block/:username
 * @description Bloquea a un usuario, marcando la relación como "bloqueada".
 * Si no existe una relación previa, se crea una nueva con estado "bloqueado".
 * @param {string} username - Nombre del usuario que bloquea.
 * @param {string} blockUsername - Nombre del usuario a bloquear.
 * @returns {Object} Mensaje indicando el éxito o error del bloqueo.
 */
router.post('/friends/block/:username', async (req, res) => {
  try {
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

    if (friendship && friendship.status === 'blocked') {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    if (!friendship) {
      friendship = new Friendship({ requester: user._id, recipient: blockedUser._id });
    }

    friendship.status = 'blocked';
    await friendship.save();

    res.json({ message: 'User blocked', friendship });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
});

/**
 * @route POST /friends/unblock/:username
 * @description Desbloquea a un usuario y elimina la relación de amistad.
 * @param {string} username - Nombre del usuario que desbloquea.
 * @param {string} blockUsername - Nombre del usuario a desbloquear.
 * @returns {Object} Mensaje indicando el éxito o error del desbloqueo.
 */
router.post('/friends/unblock/:username', async (req, res) => {
  try {
    const { blockUsername } = req.body;
    const username = req.params.username;

    // Buscar los _id de los usuarios en la colección User
    const user = await User.findOne({ username });
    const blockedUser = await User.findOne({ username: blockUsername });

    if (!user || !blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: user._id, recipient: blockedUser._id },
        { requester: blockedUser._id, recipient: user._id },
      ],
      status: 'blocked',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    if (friendship.status !== 'blocked') {
      return res.status(400).json({ message: 'Friendship is not blocked' });
    }

    await Friendship.deleteOne({
      $or: [
        { requester: user._id, recipient: blockedUser._id },
        { requester: blockedUser._id, recipient: user._id },
      ],
    });

    res.json({ message: 'User unblocked and friendship removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
});

/**
 * @route DELETE /friends/remove/:username
 * @description Elimina a un amigo aceptado y borra la relación de amistad.
 * @param {string} username - Nombre del usuario que elimina al amigo.
 * @param {string} friendUsername - Nombre del amigo que será eliminado.
 * @returns {Object} Mensaje indicando el éxito o error de la eliminación.
 */
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

    await friendship.deleteOne();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});

module.exports = router;
