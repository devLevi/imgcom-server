'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.email,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', { session: false });
router.use(bodyParser.json());
// The user provides a email and password to login
router.post('/login', localAuth, (req, res) => {
  const user = req.user.serialize();
  const jwt = createAuthToken(user);
  res.json({ jwt, user });
});

const jwtAuth = passport.authenticate('jwt', { session: false });

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const jwt = createAuthToken(req.user);
  res.json({ jwt });
});

module.exports = { router };
