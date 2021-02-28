const crypto = require('crypto');
const db = require('../models');


const Role = db.role;


exports.genInviteCode = () => {
  return crypto.randomBytes(20).toString('hex').toUpperCase();
};


exports.formatDate = rawDate => {
  // Format dat according to parameter, if no date were provided, simply use now date instead
  let d = (rawDate ? new Date(rawDate) : new Date());
  // Convert Js date into readable string with format YYYY/MM/DD - HH:MM
  const date = `${d.getFullYear()}/${('0' + (d.getMonth() + 1)).slice(-2)}/${('0' + d.getDate()).slice(-2)}`;
  const time = `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
  return `${date} - ${time}`;
};


exports.initSequence = () => {
  return new Promise((resolve, reject) => {
    global.Logger.info('UserStack init sequence to control the database state');
    const promises = [];
    // Check user roles collection
    promises.push(new Promise((resolve, reject) => {
      Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
          const rolePromises = [];
          global.Logger.info('Creating Roles for current instance...');
          rolePromises.push(new Promise((resolve, reject) => {
            new Role({ name: 'user' }).save(roleSaveErr => {
              if (roleSaveErr) {
                global.Logger.logFromCode('B_INTERNAL_ERROR_ROLE_SAVE', roleSaveErr);
                reject();
              } else {
                global.Logger.info('User role has been added to the roles collection');
                resolve();
              }
            });
          }));
          rolePromises.push(new Promise((resolve, reject) => {
            new Role({ name: 'admin' }).save(roleSaveErr => {
              if (roleSaveErr) {
                global.Logger.logFromCode('B_INTERNAL_ERROR_ROLE_SAVE', roleSaveErr);
                reject();
              } else {
                global.Logger.info('Admin role has been added to the roles collection');
                resolve();
              }
            });
          }));
          Promise.all(rolePromises).then(() => {
            global.Logger.info('Roles collection is up to date');
            resolve();
          }).catch(() => {
            reject();
          });
        } else {
          global.Logger.info('Roles collection is up to date');
          resolve();
        }
      });
    }));
    Promise.all(promises).then(() => {
      global.Logger.info('Database model is complete');
      resolve();
    }).catch(reject);
  });
};
