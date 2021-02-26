const config = require('../config/auth.config');
const db = require('../models');
const bcrypt = require('bcryptjs');
const UserHelper = require('../helpers/user.helper');
const RoleHelper = require('../helpers/role.helper');
const utils = require('../utils/server.utils');


const User = db.user;
const Role = db.role;


const connectChildrenToGodfather = (godfather, userId) => {
  // Find matching user for token ID
  UserHelper.find({ id: userId }).then(user => {
    godfather.children.push(user._id);
    user.parent = godfather._id;
    --user.depth; // Decrement user depth to match its previous parent one
    if (user.code === '') {
      user.code = utils.genInviteCode(); // Generate new invite code as user depth has been reduced from one level
    }
    godfather.save(userSaveErr => {
      global.Logger.logFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
    });
    user.save(userSaveErr => {
      global.Logger.logFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
    });
  }).catch(opts => {
    global.Logger.logFromCode(opts.code, opts.err);
  });
};


/* Exports */


exports.profileTemplate = (req, res) => {
  global.Logger.info('Request template for the /profile page');
  User.findById(req.userId, (userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }

    if (!user) {
      global.Logger.info('Request refused for the /profile template because user was not found');
      res.redirect(302, '/');
      return;
    }

    User.findById(user.parent, (godfatherFindErr, godfatherUser) => {
      // Internal server error when trying to retrieve user from database
      if (userFindErr) {
        const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
        res.status(responseObject.status).send(responseObject);
        return;
      }

      let godfather = 'Jesus';
      if (godfatherUser) {
        godfather = godfatherUser.username;
      }

      Role.find({ _id: user.roles }, (roleFindErr, userRoles) => {
        // Internal server error when trying to retrieve role from database
        if (roleFindErr) {
          const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_ROLE_FIND', {}, roleFindErr);
          opts.res.status(responseObject.status).send(responseObject);
          return;
        }

        const roles = [];
        for (let i = 0; i < userRoles.length; ++i) {
          roles.push(userRoles[i].name);
        }

        const registration = utils.formatDate(user.registration);
        global.Logger.info('Rendering template for the /profile page');
        res.render('partials/user/profile', {
          layout: 'user',
          username: user.username,
          email: user.email,
          code: user.code,
          depth: user.depth,
          godfather: godfather,
          registration: registration,
          roles: roles
        });
      });
    });
  });
};


exports.profileEditTemplate = (req, res) => {
  global.Logger.info('Request template for the /profile/edit page');
  // Find matching user for token ID
  UserHelper.find({ id: req.userId }).then(user => {
    global.Logger.info('Rendering template for the /profile/edit page');
    res.render('partials/user/edit', {
      layout: 'user',
      username: user.username,
      email: user.email,
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


exports.updateInfo = (req, res) => {
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (!form.username || !form.email) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_INFO_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  UserHelper.find({ id: req.userId }).then(user => {
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
        UserHelper.find({ filter: opts.filter }).then(matchingUser => {
          if (matchingUser) {
            taken[opts.type] = true;
            resolve();
          }
        }).catch(args => {
          if (args.code === 'B_USER_NOT_FOUND') {
            user[opts.type] = form[opts.type];
            user.save(userSaveErr => {
              if (userSaveErr) {
                reject({ code: 'B_INTERNAL_ERROR_USER_SAVE', err: userSaveErr });
              } else {
                resolve();
              }
            });
          } else {
            reject(args);
          }
        });
      });
    };
    // In case username changed, check if new one doesn't already exists in database
    if (user.username !== form.username) {
      promises.push(
        findUser({
          filter: { username: form.username },
          type: 'username'
        })
      );
    }
    // In case email changed, check if new one doesn't already exists in database
    if (user.email !== form.email) {
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


exports.updateRole = (req, res) => {
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (!form.userId || !form.roleId || typeof form.checked !== 'boolean') {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  UserHelper.find({ id: req.body.userId }).then(user => {
    UserHelper.isAdminUser(user).then(isAdmin => {
      RoleHelper.find({ id: form.roleId }).then(role => {
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
        user.save(userSaveErr => {
          if (userSaveErr) {
            const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
            res.status(responseObject.status).send(responseObject);
            return;
          }
          // Properly send success to the client
          const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_ROLE_SUCCESS');
          res.status(responseObject.status).send(responseObject);
        });
      }).catch(opts => {
        const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
        res.status(responseObject.status).send(responseObject);
      });
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


exports.updatePassword = (req, res) => {
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (!form.pass1 || !form.pass2 || !form.pass3) {
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
  // New password doesn't meet the config length
  if (form.pass2.length < config.passwordLength) {
    const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_PASSWORD_TOO_SHORT', {}, config.passwordLength);
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Find matching user for token ID
  UserHelper.find({ id: req.userId }).then(user => {
    // Password not matching the user
    if (!bcrypt.compareSync(form.pass1, user.password)) {
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_INVALID_PASSWORD');
      res.status(responseObject.status).send(responseObject);
      return;
    }
    // Hashing new password and save it for the user
    user.password = bcrypt.hashSync(form.pass2, 8);
    user.save(userSaveErr => {
      // Internal server error when trying to save user to the database
      if (userSaveErr) {
        const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
        res.status(responseObject.status).send(responseObject);
        return;
      }
      // Send password update success to the client
      const responseObject = global.Logger.buildResponseFromCode('B_PROFILE_UPDATE_PASSWORD_SUCCESS');
      res.status(responseObject.status).send(responseObject);
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};


exports.delete = (req, res) => {
  global.Logger.info('Request GET API call on /api/user/delete');
  let id = req.userId;
  // Delete come from a POST request
  if (req.body.userId) {
    id = req.body.userId;
  }
  // Find matching user for token ID
  UserHelper.find({ id: id }).then(user => {
    if (user.parent) {
      UserHelper.find({ id: user.parent }).then(godfather => {
        // Remove user id from godfather children array
        const index = godfather.children.indexOf(id);
        if (index > -1) {
          godfather.children.splice(index, 1);
        }
        // Connect each user children to godfather
        for (let i = 0; i < user.children.length; ++i) {
          connectChildrenToGodfather(godfather, user.children[i]);
        }
        // Finally delete account safely
        User.deleteOne({ _id: user._id },  userDeleteErr => {
          // Internal server error when trying to retrieve role from database
          if (userDeleteErr) {
            const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_DELETE', {}, userDeleteErr);
            res.status(responseObject.status).send(responseObject);
            return;
          }

          res.status(200).send({
            status: 200,
            code: 'B_DELETE_USER_SUCCESS',
            url: '/logout'
          });
        });
      }).catch(opts => {
        const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
        res.status(responseObject.status).send(responseObject);
      });
    } else {
      res.status(403).send({
        status: 403,
        code: 'B_NEVER_KILL_JESUS',
        message: 'You are trying to remove the super account of this website. Operation not allowed'
      });
    }
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.status(responseObject.status).send(responseObject);
  });
};
