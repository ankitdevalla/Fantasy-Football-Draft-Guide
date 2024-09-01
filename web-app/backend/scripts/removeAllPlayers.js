const mongoose = require('mongoose');
const Player = require('../models/Player'); // Adjust the path as needed

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Remove all documents from the Player collection
Player.deleteMany({})
  .then(() => {
    console.log('All players have been removed from the database.');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error removing players:', error);
  });
