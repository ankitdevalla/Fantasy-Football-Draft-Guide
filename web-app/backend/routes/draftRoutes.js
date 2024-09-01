const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const DraftPick = require('../models/DraftPick'); // Adjust the path as needed

// Route to initialize a draft
router.post('/start', async (req, res) => {
  const { draftPick, totalTeams, rounds } = req.body;

  // You might store these settings in a session, or just handle them in the frontend
  res.json({ message: 'Draft started', draftPick, totalTeams, rounds });
});


// This should be your Mongoose schema from the DraftPick model
const draftPickSchema = DraftPick.schema;

// Route to add a player to a participant's team
router.post('/add-player', async (req, res) => {
    const { playerName, participantName, playerData } = req.body;
  
    // Ensure the participant name is sanitized and used correctly
    const collectionName = `${participantName}_team`.toLowerCase().replace(/\s+/g, '_');
  
    try {
      // Create or get the model using the schema
      const ParticipantTeam = mongoose.model(collectionName, draftPickSchema);
  
      // Ensure playerName is part of playerData
      const newPlayerData = { ...playerData, playerName };
  
      const newPick = new ParticipantTeam(newPlayerData);
      await newPick.save();
  
      res.json({ message: `Player ${playerName} added to ${participantName}'s team`, newPlayerData });
    } catch (error) {
      res.status(500).json({ message: 'Error adding player', error });
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
    for (let participantName of participantNames) {
      const collectionName = `${participantName}_teams`.toLowerCase().replace(/\s+/g, '_');

      // Dynamically reference the collection and drop it
      await mongoose.connection.dropCollection(collectionName);
    }
    res.json({ message: 'Draft exited, all teams deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error exiting draft', error });
  }
});

module.exports = router;
