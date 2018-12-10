'use strict';
const { Strategy: LocalStrategy } = require('passport-local');

// Assigns the Strategy export to the name JwtStrategy using object destructuring
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assigning_to_new_variable_names
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../users');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy(
  // { usernameField: 'email' },
  (username, password, passportVerify) => {
    console.log(username);
    let user;
    User.findOne({ username: username })
      .then(_user => {
        user = _user;
        if (!user) {
          // Return a rejected promise so we break out of the chain of .thens.
          // Any errors like this will be handled in the catch block.
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect username or password'
          });
        }
        return user.validatePassword(password);
      })
      .then(isValid => {
        if (!isValid) {
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect email or password'
          });
        }
        return passportVerify(null, user);
      })
      .catch(err => {
        if (err.reason === 'LoginError') {
          return passportVerify(null, false, err);
        }
        return passportVerify(err, false);
      });
  }
);

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
  },
  (token, done) => {
    done(null, token.user);
  }
);

module.exports = { localStrategy, jwtStrategy };
