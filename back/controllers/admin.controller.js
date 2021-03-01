const UserHelper = require('../helpers/user.helper');
const RoleHelper = require('../helpers/role.helper');
const utils = require('../utils/server.utils');
//TODO allow/forbid registration saved to config?


// Private /admin template (for authenticated admin users)
exports.adminTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /admin page');
  res.render('partials/admin/menu', { layout : 'admin' });
};


// Private /admin/users template (for authenticated admin users)
exports.adminUsersTemplate = (req, res) => {
  global.Logger.info('Request template for the /admin/users page');
  // Internal variables for template
  const promises = [];
  const usersFormatted = [];
  promises.push(new Promise(resolve => {
    UserHelper.getAll().then(users => {
      RoleHelper.getAll().then(roles => {
        for (let i = 0; i < users.length; ++i) {
          let userRoles = [];
          for (let j = 0; j < roles.length; ++j) {
            userRoles.push({
              id: roles[j]._id,
              name: roles[j].name,
              checked: (users[i].roles.indexOf(roles[j]._id) !== -1)
            });
          }
          // Create template user
          const user = {
            id: users[i]._id,
            username: users[i].username,
            email: users[i].email,
            registration: utils.formatDate(users[i].registration),
            lastLogin: utils.formatDate(users[i].lastlogin),
            godfather: null,
            depth: users[i].depth,
            children: [],
            roles: userRoles
          };
          // Attach godfather to user
          promises.push(new Promise(resolve => {
            UserHelper.get({ id: users[i].parent }).then(godfather => {
              user.godfather = godfather.username;
            }).finally(() => {
              resolve();
            });
          }));
          // Attach children to user
          promises.push(new Promise(resolve => {
            UserHelper.get({ filter: { _id: { $in: users[i].children } }, multiple: true }).then(children => {
              for (let j = 0; j < children.length; ++j) {
                user.children.push(children[j].username);
              }
            }).finally(() => {
              resolve();
            });
          }));
          // Save user with template formatting
          usersFormatted.push(user);
        }
      }).catch(err => {
        global.Logger.error(`Unable to retrieve all roles, ${err}`);
      });
    }).catch(err => {
      global.Logger.error(`Unable to retrieve all users, ${err}`);
    });
    resolve();
  }));
  // On all promises resolution, render template
  Promise.all(promises).then(() => {
    global.Logger.info('Rendering template for the /admin/users page');
    res.render('partials/admin/users', {
      layout : 'admin',
      users: usersFormatted
    });
  });
};
