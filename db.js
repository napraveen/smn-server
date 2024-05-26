const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Your email address is required'],
    unique: true,
  },
  username: {
    type: String,
    required: [true, 'Your username is required'],
  },
  password: {
    type: String,
    required: [true, 'Your password is required'],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const bookSchema = new mongoose.Schema({
  bookname: String,
  author: String,
  description: String,
  fileUrl: String,
});

const Book = mongoose.model('Book', bookSchema);

const User = mongoose.model('User', userSchema);
module.exports = { User, Book };
