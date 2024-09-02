const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const DraftPick = require('../models/DraftPick');
const Player = require('../models/Player');

// Route to initialize a draft
router.post('/start', async (req, res) => {
  const { draftPick, totalTeams, rounds } = req.body;

  try {
    // Remove the availablePlayers collection if it already exists
    const existingCollection = await mongoose.connection.db.listCollections({ name: 'availablePlayers' }).next();
    if (existingCollection) {
      await mongoose.connection.db.dropCollection('availablePlayers');
    }

    // Copy all players from the players collection to availablePlayers
    const players = await Player.find();
    await mongoose.connection.collection('availablePlayers').insertMany(players);

    res.json({ message: 'Draft started and availablePlayers collection initialized', draftPick, totalTeams, rounds });
  } catch (error) {
    res.status(500).json({ message: 'Error starting draft', error });
  }
});

// Mongoose schema from the DraftPick model
const draftPickSchema = DraftPick.schema;

// Route to add a player to a participant's team
router.post('/add-player', async (req, res) => {
  const { playerName, participantName } = req.body;

  console.log('Received request to add player:', playerName, 'to participant:', participantName);

  const collectionName = `${participantName}_team`.toLowerCase().replace(/\s+/g, '_');

  try {
    // Fetch the player data from the availablePlayers collection
    const player = await mongoose.connection.collection('availablePlayers').findOne({ name: new RegExp(`^${playerName}$`, 'i') });

    if (!player) {
      console.log('Player not found in available players:', playerName);
      return res.status(404).json({ message: 'Player not found in available players' });
    }

    console.log('Player data fetched:', player);

    // Map 'name' to 'playerName' for the participant's team schema
    const playerData = {
      playerName: player.name, // map 'name' to 'playerName'
      position: player.position,
      rank: player.rank,
      tiers: player.tiers,
      avgPoints: player.avgPoints,
      sosSeason: player.sosSeason
    };

    // Create or get the model using the schema
    const ParticipantTeam = mongoose.model(collectionName, draftPickSchema);

    // Add the player to the participant's team
    const newPick = new ParticipantTeam(playerData);
    await newPick.save();

    console.log('New pick saved:', newPick);

    // Remove the player from the availablePlayers collection
    await mongoose.connection.collection('availablePlayers').deleteOne({ name: player.name });

    console.log('Player removed from available players:', playerName);

    res.json({ message: `Player ${playerName} added to ${participantName}'s team`, player });
  } catch (error) {
    console.error('Error adding player to team:', error);
    res.status(500).json({ message: 'Error adding player to team', error });
  }
});



// Route to get all player names
router.get('/player-names', async (req, res) => {
  try {
    const players = await Player.find().select('name -_id'); 
    const playerNames = players.map(player => player.name);
    res.json(playerNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching player names', error });
  }
});

// Route to get a player's data by name
router.get('/player/:playerName', async (req, res) => {
  const playerName = req.params.playerName;

  try {
    const player = await Player.findOne({ name: new RegExp(`^${playerName}$`, 'i') }); // Case-insensitive search
    if (player) {
      res.json({
        playerName: player.name,
        position: player.position,
        rank: player.rank,
        tiers: player.tiers,
        avgPoints: player.avgPoints,
        sosSeason: player.sosSeason,
      });
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching player data', error });
  }
});

// Route to get a participant's team
router.get('/team/:participantName', async (req, res) => {
  const { participantName } = req.params;
  const collectionName = `${participantName}_team`.toLowerCase().replace(/\s+/g, '_');

  const ParticipantTeam = mongoose.model(collectionName, draftPickSchema);

  try {
    const team = await ParticipantTeam.find();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error });
  }
});

// Route to exit the draft and delete all participant teams
router.post('/exit', async (req, res) => {
  const { participantNames } = req.body;

  try {
    // Drop the collection of each participant's team
    for (let participantName of participantNames) {
      const collectionName = `${participantName}_teams`.toLowerCase().replace(/\s+/g, '_');
      await mongoose.connection.dropCollection(collectionName);
    }

    // Drop the availablePlayers collection
    await mongoose.connection.db.dropCollection('availablePlayers');

    res.json({ message: 'Draft exited, all teams and available players deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error exiting draft', error });
  }
});

module.exports = router;
