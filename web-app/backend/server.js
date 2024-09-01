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

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
}));

// Example route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const playerRoutes = require('./routes/playerRoutes');
app.use('/players', playerRoutes);

const csvRoutes = require('./routes/csvRoutes');  // Adjust path as needed
app.use('/api', csvRoutes);


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
