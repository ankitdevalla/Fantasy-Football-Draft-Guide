const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Player = require('../models/Player'); // Adjust the path if your models directory is in a different location

require('dotenv').config();

// Connect to MongoDB without deprecated options
mongoose.connect(process.env.MONGO_URI);

const results = [];

fs.createReadStream(path.join(__dirname, '../../../data/cleaned_fantasy_football_players.csv'))
  .pipe(csv())
  .on('data', (data) => {
    const avgPoints = parseFloat(data["AVG. POINTS "]);
    const name = data["PLAYER NAME"];

    // Ensure that avgPoints is a valid number, if not default to 0
    if (isNaN(avgPoints)) {
      console.warn(`Warning: avgPoints for player ${name} is NaN. Setting it to 0.`);
    }

    if (name) {
      results.push({
        name: name, 
        position: data.POS,
        rank: parseInt(data.RK, 10),
        tiers: parseInt(data.TIERS, 10),
        avgPoints: !isNaN(avgPoints) ? avgPoints : 0, // Default to 0 if NaN
        sosSeason: parseInt(data["SOS SEASON"], 10),
      });
    } else {
      console.warn('Warning: Missing player name. Skipping entry.');
    }
  })
  .on('end', () => {
    Player.insertMany(results)
      .then(() => {
        console.log('CSV data uploaded to MongoDB successfully!');
        mongoose.connection.close();
      })
      .catch((error) => console.error('Error uploading CSV data:', error));
  });
