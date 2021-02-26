const config = require('../config/auth.config');
const db = require('../models');
const bcrypt = require('bcryptjs');
const utils = require('../utils/server.utils');


const User = db.user;
const Role = db.role;


const connectChildrenToGodfather = (godfather, userId) => {
  User.findById(userId, (userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      global.Logger.logFromCode('B_INTERNAL_ERROR_USER_FIND', userFindErr);
      return;
    }
    godfather.children.push(user._id);
    user.parent = godfather._id;
    --user.depth;
    if (user.code === '') {
      user.code = utils.genInviteCode(); // Generate new invite code as user depth has been reduced from one level
    }
    godfather.save(userSaveErr => {
      global.Logger.logFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
    });
    user.save(userSaveErr => {
      global.Logger.logFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
    });
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
  User.findById(req.userId, (userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }

    global.Logger.info('Rendering template for the /profile/edit page');
    res.render('partials/user/edit', {
      layout: 'user',
      username: user.username,
      email: user.email,
    });
  });
};


exports.delete = (req, res) => {
  global.Logger.info('Request GET API call on /api/user/delete');
  let id = req.userId;
  // Delete come from a post request
  if (req.body.userId) {
    id = req.body.userId;
  }

  User.findById(id, (userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }

    if (user.parent) {
      User.findById(user.parent, (userFindErr, godfather) => {
        // Internal server error when trying to retrieve user from database
        if (userFindErr) {
          const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
          res.status(responseObject.status).send(responseObject);
          return;
        }

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
      });
    } else {
      res.status(403).send({
        status: 403,
        code: 'B_NEVER_KILL_JESUS',
        message: 'You are trying to remove the super account of this website. Operation not allowed'
      });
    }
  });
};


exports.updateInfo = (req, res) => {
  User.findById(req.userId, (userFindErr, user) => {
    // TODO test not existing return from db
    const form = req.body;
    if (user.username === form.username && user.email === form.email) {
      res.status(400).send({
        status: 400,
        code: 'B_USER_INFO_NO_CHANGES',
        message: 'No username or email modification were sent'
      });
      return;
    }

    const promises = [];
    let taken = {
      username: false,
      email: false
    };

    const findUser = opts => {
      return new Promise(resolve => {
        User.findOne(opts.filter).exec((err, matchingUser) => {
          if (matchingUser) {
            taken[opts.type] = true;
            resolve();
          } else {
            user[opts.type] = form[opts.type];
            user.save(userUpdateErr => { resolve(); });
          }
        });
      });
    };

    if (user.username !== form.username) {
      promises.push(
        findUser({
          filter: { username: form.username },
          type: 'username'
        })
      );
    }

    if (user.email !== form.email) {
      promises.push(
        findUser({
          filter: { email: form.email },
          type: 'email'
        })
      );
    }

    Promise.all(promises).then(() => {
      let message = null;
      if (taken.username && !taken.email) {
        message = 'Username is already taken';
      } else if (!taken.username && taken.email) {
        message = 'Email is already taken';
      } else if (taken.username && taken.email) {
        message = 'Username and email are already taken';
      }

      res.status(200).send({
        status: 200,
        code: 'B_USER_INFO_UPDATED',
        message: message,
        info: {
          username: user.username,
          email: user.email
        },
        taken: {
          username: taken.username,
          email: taken.email
        }
      });
    });
  });
};


exports.updateRole = (req, res) => {
  User.findById(req.body.userId, (userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }

    // TODO not remove admin from first account
    if (req.body.checked === true) {
      user.roles.push(req.body.roleId);
    } else {
      const index = user.roles.indexOf(req.body.roleId);
      if (index !== -1) {
        user.roles.splice(index, 1);
      }
    }

    user.save(userSaveErr => {
      if (userSaveErr) {
        const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
        res.status(responseObject.status).send(responseObject);
      } else {
        res.status(200).send({
          status: 200,
          code: 'B_USER_ROLE_UPDATED'
        });
      }
    });
  });
};


exports.updatePassword = (req, res) => {
  // TODO test proper form fields (if not sending pass etc)
  const form = req.body;
  if (form.pass1 === '' && form.pass2 === '' && form.pass3 === '') {
    res.status(400).send({
      status: 400,
      code: 'B_USER_PASSWORD_NO_CHANGES',
      message: 'No password modification were sent'
    });
    return;
  }

  if (form.pass1 === '' || form.pass2 === '' || form.pass3 === '') {
    res.status(400).send({
      status: 400,
      code: 'B_USER_PASSWORD_MISSING_FIELD',
      message: 'Some password fields are empty',
      missing: {
        pass1: !form.pass1,
        pass2: !form.pass2,
        pass3: !form.pass3
      }
    });
    return;
  }

  User.findById(req.userId, (userFindErr, user) => {
    if (!bcrypt.compareSync(form.pass1, user.password)) {
      res.status(401).send({
        status: 401,
        code: 'B_USER_PASSWORD_NOT_VALID',
        message: 'Provided password is invalid for user.'
      });
      return;
    }

    if (form.pass2 !== form.pass3) {
      res.status(400).send({
        status: 400,
        code: 'B_USER_PASSWORD_DIFFERENT_PASSWORDS',
        message: 'The two provided passwords are not matching.'
      });
      return;
    }

    if (form.pass2.length < config.passwordLength) {
      res.status(400).send({
        status: 400,
        code: 'B_USER_PASSWORD_TOO_SHORT',
        message: `Password must be at least ${config.passwordLength} characters`
      });
      return;
    }

    user.password = bcrypt.hashSync(form.pass2, 8);
    user.save(userUpdateErr => {
      res.status(200).send({
        status: 200,
        code: 'B_USER_PASSWORD_UPDATED',
        message: 'Password successfully changed'
      });
    });
  });
};
