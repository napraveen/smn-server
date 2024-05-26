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
      title: req.body.title,
      author: req.body.author,
      fileUrl: downloadURL,
    });
    await newBook.save();

    res.status(200).json({ imageUrl: downloadURL });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(4000, () => {
  console.log('Server running on 4000');
});
