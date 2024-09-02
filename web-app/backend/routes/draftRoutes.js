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

    // Create a collection for each team
    for (let i = 1; i <= totalTeams; i++) {
      const collectionName = `team_${i}`.toLowerCase();
      await mongoose.connection.createCollection(collectionName);
    }

    res.json({ message: 'Draft started and team collections initialized', draftPick, totalTeams, rounds });
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

  const collectionName = participantName.toLowerCase().replace(/\s+/g, '_');

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
  const collectionName = participantName.toLowerCase().replace(/\s+/g, '_');

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
      const collectionName = participantName.toLowerCase().replace(/\s+/g, '_');
      const collectionExists = await mongoose.connection.db.listCollections({ name: collectionName }).next();

      if (collectionExists) {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(`Collection ${collectionName} dropped successfully`);
      }
    }

    // Drop the availablePlayers collection
    const availablePlayersExists = await mongoose.connection.db.listCollections({ name: 'availablePlayers' }).next();
    if (availablePlayersExists) {
      await mongoose.connection.db.dropCollection('availablePlayers');
      console.log('Collection availablePlayers dropped successfully');
    }

    res.json({ message: 'Draft exited, all teams and available players deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error exiting draft', error });
  }
});

// Naive Recommendation Algorithm Route
router.post('/recommend', async (req, res) => {
  const { userRoster, availablePlayers, rosterStructure, topN } = req.body;

  try {
    // Fetch all player data
    const players = await Player.find();

    // Convert the player data into an array of objects
    const playerData = players.map(player => ({
      name: player.name,
      position: player.position,
      rank: player.rank,
      tiers: player.tiers,
      avgPoints: player.avgPoints,
      sosSeason: player.sosSeason,
    }));

    // Call the recommendation function
    const recommendedPlayers = recommendPlayers(userRoster, availablePlayers, playerData, rosterStructure, topN);

    res.json(recommendedPlayers);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations', error });
  }
});

function recommendPlayers(userRoster, availablePlayers, playerData, rosterStructure, topN = 3) {
  const availablePlayersData = playerData.filter(player =>
    availablePlayers.includes(player.name)
  );

  availablePlayersData.forEach(player => {
    player.score = 0.0;
  });

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  positions.forEach(position => {
    const positionWeight = userRoster[position] < rosterStructure[position] ? 2.0 : 1.0;
    availablePlayersData.forEach(player => {
      if (player.position === position) {
        player.score += positionWeight;
      }
    });
  });

  availablePlayersData.forEach(player => {
    player.score += player.avgPoints * 0.5;
    player.score += (5 - player.sosSeason) * 0.2;
    player.score += (16 - player.tiers) * 1.0;

    const maxRank = Math.max(...availablePlayersData.map(p => p.rank));
    player.score += (maxRank - player.rank) * 0.25;
  });

  availablePlayersData.sort((a, b) => b.score - a.score);
  const recommendedPlayers = availablePlayersData.slice(0, topN);

  return recommendedPlayers.map(player => ({
    playerName: player.name,
    position: player.position,
    rank: player.rank,
    tiers: player.tiers,
    avgPoints: player.avgPoints,
    sosSeason: player.sosSeason,
  }));
}

module.exports = router;
