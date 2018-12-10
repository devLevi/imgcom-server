'use strict';

require('dotenv').config();
const os = require('os');
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const passport = require('passport');
const expressFormData = require('express-form-data');
const multer = require('multer');
const upload = multer({ dest: os.tmpdir() });

const { PORT, DATABASE_URL } = require('./config');

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.use(upload.any());
app.use(express.static('public'));
app.use(morgan('common'));

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});

app.use(upload.any());
// RUN / CLOSE SERVER

app.get('/photos', (req, res) => res.send('👌'));

app.post('/image-upload', (req, res) => {
  const values = Object.values(req.files);
  const promises = values.map(image => cloudinary.uploader.upload(image.path));

  Promise.all(promises).then(results => res.json(results));
});

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
