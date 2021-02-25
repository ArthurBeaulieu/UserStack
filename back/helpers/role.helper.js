const db = require('../models');


const Role = db.role;


exports.getAll = () => {
  return new Promise((resolve, reject) => {
    Role.find({}, (findErr, roles) => {
      if (findErr) {
        reject(findErr)
      } else {
        resolve(roles);
      }
    });
  });
};
