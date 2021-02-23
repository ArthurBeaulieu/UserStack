const db = require('../models');
const Utils = require('../utils/server.utils');


const User = db.user;
const Role = db.role;


exports.adminTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /admin page');
  res.render('partials/admin/menu', { layout : 'admin' });
};


exports.adminUsersTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /admin/users page');

  const promises = [];
  const usersFormatted = [];

  promises.push(new Promise(resolve => {
    User.find({}, (userFindErr, users) => {
      Role.find({}, (roleFindErr, roles) => {
        for (let i = 0; i < users.length; ++i) {
          let userRoles = [];

          for (let j = 0; j < roles.length; ++j) {
            userRoles.push({
              id: roles[j]._id,
              name: roles[j].name,
              checked: (users[i].roles.indexOf(roles[j]._id) !== -1)
            });
          }

          const user = {
            id: users[i]._id,
            username: users[i].username,
            email: users[i].email,
            registration: Utils.formatDate(users[i].registration),
            godfather: null,
            children: [],
            roles: userRoles
          };

          promises.push(new Promise(resolve => {
            User.findById(users[i].parent, (godfatherFindErr, godfather) => {
              if (godfather) {
                user.godfather = godfather.username;
              }
              resolve();
            });
          }));

          promises.push(new Promise(resolve => {
            User.find({ _id: { $in: users[i].children } }, (childrenFindErr, children) => {
              for (let j = 0; j < children.length; ++j) {
                user.children.push(children[j].username);
              }
              resolve();
            });
          }));

          usersFormatted.push(user);
        }
      });
    });
    resolve();
  }));

  Promise.all(promises).then(() => {
    res.render('partials/admin/users', {
      layout : 'admin',
      users: usersFormatted
    });
  });
};
