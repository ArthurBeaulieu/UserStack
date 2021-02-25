const db = require('../models');


const User = db.user;


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
