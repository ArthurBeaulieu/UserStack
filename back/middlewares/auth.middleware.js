const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const UserHelper = require('../helpers/user.helper');
const RoleHelper = require('../helpers/role.helper');


// Check token validity from request's cookies to allow access
isLoggedIn = (req, res, next) => {
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
      global.Logger.error('Access refused, the token is either invalid or expired. Redirecting to /login');
      res.redirect('/login');
      return;
    }
    // Access granted, call next to exist middleware
    global.Logger.info(`Token validated, access granted for user with id ${decoded.id}`);
    req.userId = decoded.id; // Attach user id to the request before any further treatment
    next();
  });
};


// Check database to grant or not access if user has admin role
isAdmin = (req, res, next) => {
  global.Logger.info('Request an admin check on user');
  UserHelper.get({ id: req.userId }).then(user => {
    RoleHelper.get({ filter: { _id: { $in: user.roles } }, multiple: true }).then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'admin') {
          global.Logger.info('User has the admin role, access granted');
          next();
          return;
        }
      }
      global.Logger.info('User does not have the admin role, access refused');
      res.redirect('/');
    }).catch(opts => {
      global.Logger.logFromCode(opts.code, opts.err);
      res.redirect('/');
    });
  }).catch(opts => {
    global.Logger.logFromCode(opts.code, opts.err);
    res.redirect('/');
  });
};


// Check if username/email are already taken in database, for API POST requests
checkDuplicateUsernameOrEmail = (req, res, next) => {
  global.Logger.info('Check existing username or mail in database');
  // Avoid to send status twice to frontend
  let responseSent = false;
  const promises = [];
  // Username testing promise
  promises.push(new Promise((resolve, reject) => {
    UserHelper.get({ filter: { username: req.body.username } }).then(user => {
      global.Logger.warn('Requested username is already taken in database');
      if (responseSent === false) {
        responseSent = true;
        const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_EXISTING_USERNAME', {}, user.username);
        res.status(responseObject.status).send(responseObject);
      }
      reject();
    }).catch(opts => {
      if (opts.err) {
        global.Logger.error('Unable to access the User collection for username');
        if (responseSent === false) {
          responseSent = true;
          const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
          res.status(responseObject.status).send(responseObject);
        }
        reject();
      } else if (opts.code === 'B_USER_NOT_FOUND' && req.body.username !== '') {
        global.Logger.info('Requested username is available in database');
        resolve();
      }
    });
  }));
  // Email testing promise
  promises.push(new Promise((resolve, reject) => {
    UserHelper.get({ filter: { email: req.body.email } }).then(user => {
      global.Logger.warn('Requested email is already taken in database');
      if (responseSent === false) {
        responseSent = true;
        const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_EXISTING_EMAIL', {}, user.username);
        res.status(responseObject.status).send(responseObject);
      }
      reject();
    }).catch(opts => {
      if (opts.err) {
        global.Logger.error('Unable to access the User collection for email');
        if (responseSent === false) {
          responseSent = true;
          const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
          res.status(responseObject.status).send(responseObject);
        }
        reject();
      } else if (opts.code === 'B_USER_NOT_FOUND' && req.body.username !== '') {
        global.Logger.info('Requested username is available in database');
        resolve();
      }
    });
  }));
  // Continue when all promises are resolved
  Promise.all(promises).then(() => {
    global.Logger.info('Username and email are not taken in database');
    next();
  }).catch(() => {
    global.Logger.warn('Requested username or mail is already taken');
  });
};


module.exports = {
  isLoggedIn,
  isAdmin,
  checkDuplicateUsernameOrEmail
};
