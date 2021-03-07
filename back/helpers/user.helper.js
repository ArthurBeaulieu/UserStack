const jwt = require('jsonwebtoken');
const db = require('../models');
const authConfig = require('../config/auth.config.js');


const User = db.user;
const Role = db.role;


exports.new = opts => {
  return new User({
    username: opts.username,
    email: opts.email,
    code: opts.code,
    password: opts.password,
    depth: opts.depth
  });
};


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
        if (opts.empty) {
          resolve(null);
        } else {
          reject({ code: 'B_USER_NOT_FOUND' });
        }
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
      } else if (opts.populate) {
        User.findOne(opts.filter).populate('roles', '-__v').exec((userFindErr, user) => {
          rejection(userFindErr, user);
          resolve(user);
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


exports.count = () => {
  return new Promise((resolve, reject) => {
    User.countDocuments({}, (userCountErr, count) => {
      if (userCountErr) {
        const err = new Error(userCountErr);
        reject({ code: 'B_INTERNAL_ERROR_USER_COUNT', err: err.toString() });
      }
      resolve(count);
    });
  });
};


exports.save = user => {
  return new Promise((resolve, reject) => {
    user.save(userSaveErr => {
      if (userSaveErr) {
        const err = new Error(userSaveErr);
        reject({ code: 'B_INTERNAL_ERROR_USER_SAVE', err: err.toString() });
      }
      resolve();
    });
  });
};


exports.delete = filter => {
  return new Promise((resolve, reject) => {
    User.deleteOne(filter,  userDeleteErr => {
      if (userDeleteErr) {
        const err = new Error(userDeleteErr);
        reject({ code: 'B_INTERNAL_ERROR_USER_DELETE', err: err.toString() });
      }
      resolve();
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
    jwt.verify(token, authConfig.secret, err => {
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
      global.log.error('No user provided to retrieve roles from');
      reject();
    }

    Role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        global.log.error('Unable to retrieve roles for user');
        reject();
      }
      // Search for admin role in user's role list
      for (let i = 0; i < roles.length; ++i) {
        if (roles[i].name === 'admin') {
          resolve(true);
        }
      }
      // Resolve as not admin by default
      resolve(false);
    });
  });
};
