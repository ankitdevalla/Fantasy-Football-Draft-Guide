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
  origin: 'http://localhost:3000', // Allow requests from the React frontend
}));

// Example route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const playerRoutes = require('./routes/playerRoutes');
app.use('/api', playerRoutes);

const csvRoutes = require('./routes/csvRoutes');  // Adjust path as needed
app.use('/api', csvRoutes);

const draftRoutes = require('./routes/draftRoutes');
app.use('/api/draft', draftRoutes);


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
