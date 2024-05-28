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
  verified: {
    type: String,
    required: [false],
    default: '',
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

const IssuedBookSchema = new mongoose.Schema({
  bookname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required'],
  },
  availedUser: {
    type: String,
    required: [false],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model('Book', bookSchema);

const User = mongoose.model('User', userSchema);
const IssuedBook = mongoose.model('IssuedBook', IssuedBookSchema);
module.exports = { User, Book, IssuedBook };
