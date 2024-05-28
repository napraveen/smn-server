const express = require('express');
const app = express();
const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { User } = require('../db');
require('dotenv').config();
router.post(
  '/signup',
  [
    check('email', 'Please provide a vaild email').isEmail(),
    check('password', 'Please provide a password greater than 5').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { password, email, username } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    let existinguser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existinguser) {
      return res.status(400).json({
        errors: [
          {
            msg: 'This user already exists',
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    const token = await JWT.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 36000000,
      }
    );

    // res.cookie('token', token, {
    //   httpOnly: false,
    //   maxAge: 36000000,
    // });

    res.json({
      token,
      success: true,
      message: 'signed up successfully',
    });
  }
);

router.post('/login', async (req, res) => {
  const { password, email, username } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({
      errors: [
        {
          msg: 'Invalid Credentials',
        },
      ],
    });
  }
  let isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      errors: [
        {
          msg: 'Invalid Credentials',
        },
      ],
    });
  }
  const token = await JWT.sign(
    {
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 36000000,
    }
  );

  // res.cookie('token', token, {
  //   httpOnly: true,
  //   maxAge: 36000000,
  // });

  res.cookie('token', token, {
    httpOnly: false,
    maxAge: 36000000,
    sameSite: 'None',
    secure: true,
  });

  res.json({
    token,
    success: true,
    message: 'Successfully logged in',
  });
});

router.get('/check-auth', (req, res) => {
  const token = req.cookies.token;
  // console.log('Received token:', token);

  if (!token) {
    return res.json({ authenticated: false, message: 'Token not found' });
  }

  JWT.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.json({
        authenticated: false,
        message: 'Error verifying token',
      });
    }
    const email = decoded.email;
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.clearCookie('token');

      return res.json({
        authenticated: false,
        message: 'User not found',
      });
    }

    const username = user.username;
    // const user = await User.findOne({ email: decoded.email });
    // if (!user) {
    //   return res.json({
    //     authenticated: false,
    //     message: 'User not found',
    //   });
    // }

    return res.json({ authenticated: true, username: username });
  });
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
