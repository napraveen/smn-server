const express = require('express');
const app = express();
const { User, Book } = require('./db');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('./firebaseConfig.js');

app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/auth', require('./routes/auth'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB is connected successfully'))
  .catch((err) => console.error(err));

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

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send(err);
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-image', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileBuffer = file.buffer;
    const storageRef = ref(storage, 'uploads/' + file.originalname);
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    const newBook = new Book({
      bookname: req.body.bookname,
      author: req.body.author,
      description: req.body.description,
      fileUrl: downloadURL,
    });
    console.log(newBook);
    await newBook.save();

    res.status(200).json({ imageUrl: downloadURL });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/allusers', async (req, res) => {
  const users = await User.find();
  console.log(users);
  res.json(users);
});
app.post('/verify', async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (user) {
    user.verified = true;
    await user.save();
    res.json({ success: true, message: 'User verified' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/reject', async (req, res) => {
  const { userId } = req.body;
  console.log(`Deleting user with ID: ${userId}`);
  const user = await User.findByIdAndDelete(userId);
  if (user) {
    res.json({ success: true, message: 'User deleted' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(4000, () => {
  console.log('Server running on 4000');
});
