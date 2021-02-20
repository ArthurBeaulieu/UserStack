const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');


const User = db.user;
const Role = db.role;


verifyToken = (req, res, next) => {
  global.Logger.info('Request a token validation');
  // Extract token from session cookies
  let token = req.cookies.jwtToken;
  if (!token) {
    global.Logger.warn('No valid token where found in cookies. Redirecting to /login');
    res.redirect('/login');
    return;
  }
  // Check token with jwt token module
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      global.Logger.error('Access refused, the token is either invalid or expired');
      res.redirect('/login');
      return;
    }
    global.Logger.info(`Token validated, access granted for user with id ${decoded.id}`);
    req.userId = decoded.id;
    next();
  });
};


isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === 'admin') {
            next();
            return;
          }
        }

        res.status(403).send({ message: 'Require Admin Role!' });
        return;
      }
    );
  });
};


isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === 'moderator') {
            next();
            return;
          }
        }

        res.status(403).send({ message: 'Require Moderator Role!' });
        return;
      }
    );
  });
};


checkDuplicateUsernameOrEmail = (req, res, next) => {
  global.Logger.info('Check existing username or mail in database for new registration');
  // Avoid to send status twice to frontend
  let responseSent = false;
  const promises = [];
  // Username testing promise
  promises.push(new Promise((resolve, reject) => {
    User.findOne({
      username: req.body.username
    }).exec((err, user) => {
      if (err) {
        global.Logger.error('Unable to access the User collection for username');
        if (responseSent === false) {
          responseSent = true;
          res.status(500).send({ message: err });
        }
        reject();
      }
      // Found a matching user for username ; it's already taken
      if (user) {
        global.Logger.warn('Requested username is already taken in database');
        if (responseSent === false) {
          responseSent = true;
          res.status(409).send({
            status: 409,
            code: 'B_REGISTER_EXISTING_USERNAME',
            message: 'This username is already taken. Please choose another one.'
          });
        }
        reject();
      } else if (req.body.username !== '') {
        global.Logger.info('Requested username is available in database');
      }
      resolve();
    });
  }));
  // Email testing promise
  promises.push(new Promise((resolve, reject) => {
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        global.Logger.error('Unable to access the User collection for email');
        if (responseSent === false) {
          responseSent = true;
          res.status(500).send({ message: err });
        }
        reject();
      }
      // Found a matching user for email ; it's already taken
      if (user) {
        global.Logger.warn('Requested email is already taken in database');
        if (responseSent === false) {
          responseSent = true;
          res.status(409).send({
            status: 409,
            code: 'B_REGISTER_EXISTING_EMAIL',
            message: 'This email is already in use. Please choose another one.'
          });
        }
        reject();
      } else if (req.body.email !== '') {
        global.Logger.info('Requested email is available in database');
      }
      resolve();
    });
  }));
  // Middleware resolution
  Promise.all(promises).then(() => {
    global.Logger.info('Username and email are not taken in database, continue registration process');
    next();
  }).catch(() => {
    global.Logger.warn('Cancel registration process as requested username or mail is already taken');
  });
};


const authMiddleware = {
  verifyToken,
  isAdmin,
  isModerator,
  checkDuplicateUsernameOrEmail
};


module.exports = authMiddleware;
