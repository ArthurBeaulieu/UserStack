const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth.config');
const UserHelper = require('../helpers/user.helper');
const RoleHelper = require('../helpers/role.helper');
const utils = require('../utils/server.utils');


// For a given user, connect all its children to its godfather
const _connectChildrenToGodfather = (godfather, children) => {
  return new Promise((resolve, reject) => {
    const connectChild = i => {
      if (i < children.length) {
        // Find matching user for token ID
        UserHelper.get({ id: children[i] }).then(user => {
          global.Logger.info(`Attaching ${user.username} as a children of ${godfather.username}`);
          godfather.children.push(user._id);
          user.parent = godfather._id;
          --user.depth; // Decrement user depth to match its previous parent one
          if (user.code === '') {
            user.code = utils.genInviteCode(); // Generate new invite code as user depth has been reduced from one level
          }
          // Saving godfather and user
          UserHelper.save(godfather).then(() => {
            UserHelper.save(user).then(() => {
              connectChild(++i);
            }).catch(reject);
          }).catch(reject);
        }).catch(reject);
      } else {
        resolve();
      }
    };
    if (children.length === 0) {
      resolve();
    } else {
      // Start recursive calls
      connectChild(0);
    }
  });
};


/* Exported methods */


// Private /profile template (for authenticated users)
exports.profileTemplate = (req, res) => {
  global.Logger.info('Request template for the /profile page');
  global.Logger.info(`Search a matching user for id ${req.userId}`);
  UserHelper.get({ id: req.userId }).then(user => {
    global.Logger.info(`Matching user ${user.username} to display the profile`);
    UserHelper.get({ id: user.parent || '', empty: true }).then(godfather => {
      global.Logger.info(`Matching godfather ${godfather.username} for user ${user.username}`);
      RoleHelper.get({ filter: { _id: user.roles }, multiple: true }).then(userRoles => {
        const roles = [];
        for (let i = 0; i < userRoles.length; ++i) {
          roles.push(userRoles[i].name);
        }

        global.Logger.info('Rendering template for the /profile page');
        res.render('partials/user/profile', {
          layout: 'user',
          username: user.username,
          email: user.email,
          code: user.code,
          depth: user.depth,
          godfather: godfather.username,
          registration: utils.formatDate(user.registration),
          lastLogin: utils.formatDate(user.lastlogin),
          roles: roles
        });
      }).catch(opts => {
        if (opts.err) {
          const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
          res.status(responseObject.status).send(responseObject);
        } else {
          global.Logger.logFromCode(opts.code, {}, opts.err);
          res.redirect(302, '/');
        }
      });
    }).catch(opts => {
      const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.status(responseObject.status).send(responseObject);
    });
  }).catch(opts => {
    global.Logger.logFromCode(opts.code, {}, opts.err);
    res.redirect(302, '/');
  });
};


// Private /profile/edit template (for authenticated users)
exports.profileEditTemplate = (req, res) => {
  global.Logger.info('Request template for the /profile/edit page');
  // Find matching user for token ID
  UserHelper.get({ id: req.userId }).then(user => {
    global.Logger.info('Rendering template for the /profile/edit page');
    res.render('partials/user/edit', {
      layout: 'user',
      username: user.username,
      email: user.email,
    });
  }).catch(opts => {
    global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.redirect(302, '/');
  });
};


// Submission from user information submit
exports.updateInfo = (req, res) => {
  global.Logger.info(`Request ${req.method} API call on /api/user/update/info`);
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (form.username === undefined || form.email === undefined) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_INFO_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent missing arguments from request
  if (form.username === '' || form.email === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_INFO_MISSING_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  global.Logger.info(`Search a matching user for id ${req.userId}`);
  UserHelper.get({ id: req.userId }).then(user => {
    global.Logger.info(`Matching user ${user.username} to update the info`);
    // Ensure fields contains changes
    if (user.username === form.username && user.email === form.email) {
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_INFO_NO_CHANGES');
      res.status(responseObject.status).send(responseObject);
      return;
    }
    // Internal variables
    const promises = [];
    let taken = {
      username: false,
      email: false
    };
    // Enclosed method to check if user exists (from username or email). If not, saving new one to user
    const findUser = opts => {
      return new Promise((resolve, reject) => {
        UserHelper.get({ filter: opts.filter }).then(matchingUser => {
          // Not changing user[type] as its already taken in database
          if (matchingUser) {
            taken[opts.type] = true;
            resolve();
          }
        }).catch(args => {
          if (args.code === 'B_USER_NOT_FOUND') {
            user[opts.type] = form[opts.type];
            UserHelper.save(user).then(resolve).catch(reject);
          } else {
            reject(args);
          }
        });
      });
    };
    // In case username changed, check if new one doesn't already exists in database
    if (user.username !== form.username) {
      global.Logger.info('Search in database if new username is not already taken');
      promises.push(
        findUser({
          filter: { username: form.username },
          type: 'username'
        })
      );
    }
    // In case email changed, check if new one doesn't already exists in database
    if (user.email !== form.email) {
      global.Logger.info('Search in database if new email is not already taken');
      promises.push(
        findUser({
          filter: { email: form.email },
          type: 'email'
        })
      );
    }
    // When all promises are resolved, prepare client response
    Promise.all(promises).then(() => {
      // Send response to client
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_INFO_UPDATED', {
        info: {
          username: user.username,
          email: user.email
        },
        taken: {
          username: taken.username,
          email: taken.email
        }
      });
      res.status(responseObject.status).send(responseObject);
    }).catch(opts => {
      const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.status(responseObject.status).send(responseObject);
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


// Submission from user password fields submit
exports.updatePassword = (req, res) => {
  global.Logger.info(`Request ${req.method} API call on /api/user/update/password`);
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (form.pass1 === undefined || form.pass2 === undefined || form.pass3 === undefined) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent all missing arguments from request
  if (form.pass1 === '' && form.pass2 === '' && form.pass3 === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_EMPTY_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent missing arguments from request
  if (form.pass1 === '' || form.pass2 === '' || form.pass3 === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_MISSING_FIELD', {
      missing: {
        pass1: !form.pass1,
        pass2: !form.pass2,
        pass3: !form.pass3
      }
    });
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Sent password not matching
  if (form.pass2 !== form.pass3) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_DIFFERENT_PASSWORDS');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Test actual changing of password
  if (form.pass1 === form.pass2) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_SAME_PASSWORDS');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // New password doesn't meet the auth config length
  if (form.pass2.length < authConfig.passwordLength) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_PASSWORD_TOO_SHORT', {}, authConfig.passwordLength);
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  global.Logger.info(`Search a matching user for id ${req.userId}`);
  UserHelper.get({ id: req.userId }).then(user => {
    global.Logger.info(`Matching user ${user.username} to update the password`);
    // Password not matching the user
    if (!bcrypt.compareSync(form.pass1, user.password)) {
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_INVALID_PASSWORD');
      res.status(responseObject.status).send(responseObject);
      return;
    }
    // Hashing new password and save it for the user
    user.password = bcrypt.hashSync(form.pass2, authConfig.saltRounds);
    UserHelper.save(user).then(() => {
      // Send password update success to the client
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_SUCCESS');
      res.status(responseObject.status).send(responseObject);
    }).catch(opts => {
      const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.status(responseObject.status).send(responseObject);
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


// Submission from user delete button or admin delete user button
exports.delete = (req, res) => {
  global.Logger.info(`Request ${req.method} API call on /api/user/delete`);
  let id = req.userId;
  // Delete come from a POST request
  if (req.body.userId) {
    id = req.body.userId;
  }
  // Find matching user for token ID
  global.Logger.info(`Search a matching user for id ${id}`);
  UserHelper.get({ id: id }).then(user => {
    global.Logger.info(`Matching user ${user.username} to be deleted`);
    if (user.parent.toString() !== id) { // Root parent is Root, avoid suppressing it, convert to string to make it comparable
      global.Logger.info(`Search a matching godfather for id ${user.parent}`);
      UserHelper.get({ id: user.parent }).then(godfather => {
        global.Logger.info(`Matching user ${godfather.username} to remove ${user.username} from its children`);
        // Remove user id from godfather children array
        const index = godfather.children.indexOf(id);
        if (index > -1) {
          godfather.children.splice(index, 1);
        }
        // Connect each user children to godfather
        global.Logger.info(`Start connecting all children of ${user.username} to its godfather ${godfather.username}`);
        _connectChildrenToGodfather(godfather, user.children).then(() => {
          // Finally delete account safely
          global.Logger.info(`Now deleting ${user.username} from database`);
          UserHelper.delete({ _id: user._id }).then(() => {
            // User deletion successful
            const responseObject = global.Logger.buildResponseFromCode('B_USER_DELETE_SUCCESS', { url: '/logout' });
            res.status(responseObject.status).send(responseObject);
          }).catch(opts => {
            const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
            res.status(responseObject.status).send(responseObject);
          });
        }).catch(opts => {
          const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
          res.status(responseObject.status).send(responseObject);
        });
      }).catch(opts => {
        const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
        res.status(responseObject.status).send(responseObject);
      });
    } else {
      const responseObject = global.Logger.buildResponseFromCode('B_NEVER_KILL_ROOT');
      res.status(responseObject.status).send(responseObject);
    }
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


// Submission from user role checkbox in admin users page
exports.updateRole = (req, res) => {
  global.Logger.info(`Request ${req.method} API call on /api/user/update/role`);
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (form.userId === undefined || form.roleId === undefined || typeof form.checked !== 'boolean') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent missing arguments from request
  if (form.userId === '' || form.roleId === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_MISSING_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  global.Logger.info(`Search a matching user for id ${form.userId}`);
  UserHelper.get({ id: form.userId }).then(user => {
    global.Logger.info(`Matching user ${user.username} to update roles`);
    UserHelper.isAdminUser(user).then(isAdmin => {
      global.Logger.info(`Search a matching role for id ${form.roleId}`);
      RoleHelper.get({ id: form.roleId }).then(role => {
        global.Logger.info(`Matching role ${role.name} to update for ${user.username}`);
        if (form.checked === true) {
          user.roles.push(form.roleId);
        } else {
          // Forbid to remove admin role from root user (depth 0)
          if (isAdmin && role.name === 'admin') {
            const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_CANT_REMOVE_ADMIN_FROM_ROOT');
            res.status(responseObject.status).send(responseObject);
            return;
          }
          // Otherwise remove role from user's one
          const index = user.roles.indexOf(form.roleId);
          if (index !== -1) {
            user.roles.splice(index, 1);
          }
        }
        // Update user into database
        UserHelper.save(user).then(() => {
          // Properly send success to the client
          const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_SUCCESS', {}, user.username);
          res.status(responseObject.status).send(responseObject);
        }).catch(opts => {
          const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
          res.status(responseObject.status).send(responseObject);
        });
      }).catch(opts => {
        const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
        res.status(responseObject.status).send(responseObject);
      });
    }).catch(opts => {
      const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.status(responseObject.status).send(responseObject);
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};