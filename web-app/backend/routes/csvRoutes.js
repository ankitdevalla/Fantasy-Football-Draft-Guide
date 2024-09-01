const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

router.get('/csv-data', (req, res) => {
  const results = [];
  
  // Adjust the path to point to your CSV file location
  fs.createReadStream(path.join(__dirname, '../../../data/cleaned_fantasy_football_players.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);  // Send the parsed CSV data as JSON
    });
});

module.exports = router;
