const express = require('express');

const app = express();
const { User } = require('./db');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(
  cors({
    origin: ['https://smn-client.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(cookieParser());
require('dotenv').config();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB is  connected successfully'))
  .catch((err) => console.error(err));

app.use('/auth', require('./routes/auth'));
app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/api/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json(user);
    console.log(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(4000, () => {
  console.log('Server running on 4000');
});
