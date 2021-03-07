const db = require('../models');


const AuthToken = db.authtoken;


exports.new = opts => {
  return new AuthToken({
    _userId: opts.userId,
    token: opts.token,
    createdAt: opts.createdAt
  });
};


exports.get = token => {
  return new Promise((resolve, reject) => {
    // Enclosed method to perform standard failure test upon model response
    const rejection = (authTokenFindErr, authToken) => {
      // Internal server error when trying to retrieve token from database
      if (authTokenFindErr) {
        const err = new Error(authTokenFindErr);
        reject({ code: 'B_INTERNAL_ERROR_AUTH_TOKEN_FIND', err: err.toString() });
      }
      // Token not found in database
      if (!authToken) {
        reject({ code: 'B_AUTH_TOKEN_NOT_FOUND' });
      }
    };
    // Search for token in collection
    AuthToken.findOne({ token: token }, (authTokenFindErr, authToken) => {
      rejection(authTokenFindErr, authToken);
      resolve(authToken);
    });
  });
};


exports.save = authToken => {
  return new Promise((resolve, reject) => {
    authToken.save(authTokenSaveErr => {
      if (authTokenSaveErr) {
        const err = new Error(authTokenSaveErr);
        reject({ code: 'B_INTERNAL_ERROR_AUTH_TOKEN_SAVE', err: err.toString() });
      }
      resolve();
    });
  });
};


exports.delete = filter => {
  return new Promise((resolve, reject) => {
    AuthToken.deleteOne(filter,  authTokenDeleteErr => {
      if (authTokenDeleteErr) {
        const err = new Error(authTokenDeleteErr);
        reject({ code: 'B_INTERNAL_ERROR_AUTH_TOKEN_DELETE', err: err.toString() });
      }
      resolve();
    });
  });
};
