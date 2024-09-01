const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Example route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const playerRoutes = require('./routes/playerRoutes');
app.use('/players', playerRoutes);


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
