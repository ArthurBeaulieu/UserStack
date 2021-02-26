const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');


const User = db.user;
const Role = db.role;


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
        global.Logger.error('Unable to retrieve roles for user')
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
