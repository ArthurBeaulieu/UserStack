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
  return new Promise(resolve => {
    global.Logger.info('UserStack init sequence to control the database state');
    const promises = [];
    // Check user roles collection
    promises.push(new Promise(resolve => {
      Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
          global.Logger.info('Creating Roles for current instance...');
          new Role({ name: 'user' }).save(err => {
            if (err) { global.Logger.error(`Unable to add User role to the roles collection : ${err}`); }
            global.Logger.info('User role has been added to the roles collection');
          });
          new Role({ name: 'moderator' }).save(err => {
            if (err) { global.Logger.error(`Unable to add Moderator role to the roles collection : ${err}`); }
            global.Logger.info('Moderator role has been added to the roles collection');
          });
          new Role({ name: 'admin' }).save(err => {
            if (err) { global.Logger.error(`Unable to add Admin role to the roles collection : ${err}`); }
            global.Logger.info('Admin role has been added to the roles collection');
          });
        }
        global.Logger.info('Roles collection is up to date');
        resolve();
      });
    }));
    Promise.all(promises).then(() => {
      global.Logger.info('Database model is complete');
      resolve();
    });
  });
};
