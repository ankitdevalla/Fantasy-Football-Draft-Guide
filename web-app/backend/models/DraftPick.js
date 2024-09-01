const mongoose = require('mongoose');

const draftPickSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  position: { type: String, required: true },
  rank: { type: Number, required: true },
  tiers: { type: Number, required: true },
  avgPoints: { type: Number, required: true },
  sosSeason: { type: Number, required: true },
});

const DraftPick = mongoose.model('DraftPick', draftPickSchema);
module.exports = DraftPick;
