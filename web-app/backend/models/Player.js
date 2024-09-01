const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  rank: { type: Number, required: true },
  tiers: { type: Number, required: true },
  avgPoints: { type: Number, required: true },
  sosSeason: { type: Number, required: true },
});

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
