const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors= require('cors');
require('dotenv').config();
const app = express();
const userRoute= require('./app/routes/userRoute')

const MONGODB_URI = process.env.MONGODB_URI; 
const PORT = 5004;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use('/api/users', userRoute)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


