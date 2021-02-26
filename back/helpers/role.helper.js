const db = require('../models');


const Role = db.role;


exports.find = opts => {
  return new Promise((resolve, reject) => {
    // Enclosed method to perform standard failure test upon model response
    const rejection = (roleFindErr, role) => {
      // Internal server error when trying to retrieve user from database
      if (roleFindErr) {
        const err = new Error(roleFindErr);
        reject({ code: 'B_INTERNAL_ERROR_ROLE_FIND', err: err.toString() });
      }
      // User not found in database
      if (!role) {
        reject({ code: 'B_ROLE_NOT_FOUND' });
      }
    };
    // Find role depending on opts type
    if (opts.id) { // Find by ID
      Role.findById(opts.id, (roleFindErr, role) => {
        rejection(roleFindErr, role);
        resolve(role);
      });
    }
  });
};



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
