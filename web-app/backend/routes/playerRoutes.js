const router = require('express').Router();
const Player = require('../models/Player');

// GET /api/players - Fetch all player data from MongoDB, excluding _id and __v
router.get('/players', async (req, res) => {
  try {
    const players = await Player.find().select('-_id -__v');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players', error });
  }
});

// // Get all players
// router.get('/', async (req, res) => {
//   try {
//     const players = await Player.find();
//     res.json(players);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Add a new player
// router.post('/add', async (req, res) => {
//   const player = new Player(req.body);
//   try {
//     const newPlayer = await player.save();
//     res.status(201).json(newPlayer);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Update a player
// router.put('/update/:id', async (req, res) => {
//   try {
//     const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(player);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Delete a player
// router.delete('/delete/:id', async (req, res) => {
//   try {
//     await Player.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Player deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
