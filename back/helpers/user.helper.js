const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');


const User = db.user;
const Role = db.role;


exports.get = opts => {
  return new Promise((resolve, reject) => {
    // Enclosed method to perform standard failure test upon model response
    const rejection = (userFindErr, user) => {
      // Internal server error when trying to retrieve user from database
      if (userFindErr) {
        const err = new Error(userFindErr);
        reject({ code: 'B_INTERNAL_ERROR_USER_FIND', err: err.toString() });
      }
      // User not found in database
      if (!user) {
        reject({ code: 'B_USER_NOT_FOUND' });
      }
    };
    // Find user depending on opts type
    if (opts.id) { // Find by ID
      User.findById(opts.id, (userFindErr, user) => {
        rejection(userFindErr, user);
        resolve(user);
      });
    } else if (opts.filter) {
      if (opts.multiple) {
        User.find(opts.filter, (userFindErr, users) => {
          rejection(userFindErr, users);
          resolve(users);
        });
      } else {
        User.findOne(opts.filter, (userFindErr, user) => {
          rejection(userFindErr, user);
          resolve(user);
        });
      }
    }
  });
};


exports.getAll = () => {
  return new Promise((resolve, reject) => {
    User.find({}, (findErr, users) => {
      if (findErr) {
        reject(findErr)
      } else {
        resolve(users);
      }
    });
  });
};


exports.isLoggedIn = req => {
  return new Promise(resolve => {
    // Extract token from session cookies
    let token = req.cookies.jwtToken;
    if (!token) {
      resolve(false);
    }
    // Check token with jwt token module
    jwt.verify(token, config.secret, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};


exports.isAdminUser = user => {
  return new Promise((resolve, reject) => {
    if (!user || !user.roles) {
      global.Logger.error('No user provided to retrieve roles from');
      reject();
    }

    Role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        global.Logger.error('Unable to retrieve roles for user');
        reject();
      }

      for (let i = 0; i < roles.length; ++i) {
        if (roles[i].name === 'admin') {
          resolve(true);
        }
      }

      resolve(false);
    });
  });
};
