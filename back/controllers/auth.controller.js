const config = require('../config/auth.config');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RoleHelper = require('../helpers/role.helper');
const utils = require('../utils/server.utils');


const User = db.user;


// Check sent password and compare with matching user to authorize login or not
const finalizeLogin = opts => {
  // Password not matching the user
  if (!bcrypt.compareSync(opts.form.password, opts.user.password)) {
    const responseObject = global.Logger.buildResponseFromCode('B_LOGIN_INVALID_PASSWORD', {}, opts.user.username);
    opts.res.status(responseObject.status).send(responseObject);
    return;
  }
  // Update user last login and save it to the database
  opts.user.lastlogin = new Date();
  opts.user.save(userSaveErr => {
    if (userSaveErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
      opts.res.status(responseObject.status).send(responseObject);
      return;
    }
    // Only create token for user if save was successful
    const token = jwt.sign({ id: opts.user.id }, config.secret, { expiresIn: 86400 });
    // Cookie expires in one day for session
    opts.res.cookie('jwtToken', token, { maxAge: 8640000, httpOnly: true });
    // Send proper redirection after login
    const responseObject = global.Logger.buildResponseFromCode('B_LOGIN_SUCCESS', { url: '/home' }, opts.user.username);
    opts.res.status(responseObject.status).send(responseObject);
  });
};


// Confirm registration and save new user in database
const finalizeRegistration = opts => {
  if (opts.firstAccount && opts.form.code !== config.adminCode) {
    const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_INVALID_CODE');
    opts.res.status(responseObject.status).send(responseObject);
    return;
  }
  // Search for existing parent, can't use helper because of specific register handling
  User.findOne({ code: opts.form.code }, (userFindErr, godfather) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      opts.res.status(responseObject.status).send(responseObject);
      return;
    }
    // User hierarchy update if not first register on app
    if (!opts.firstAccount) {
      // First account invite code is handle before
      if (!godfather) {
        const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_INVALID_CODE');
        opts.res.status(responseObject.status).send(responseObject);
        return;
      } else {
        // Update new user and its godfather information
        global.Logger.info(`Updating ${godfather.username} code and add ${opts.user.username} to its children list`);
        godfather.code = utils.genInviteCode();
        godfather.children.push(opts.user._id);
        opts.user.depth = godfather.depth + 1;
        opts.user.parent = godfather._id;
        if (opts.user.depth >= config.maxDepth) {
          opts.user.code = ''; // Remove invite code if max depth is reached
        }
      }
    }
    // Retrieve roles from model
    RoleHelper.get({ filter: { name: ['user', 'admin'] }, multiple: true }).then(roles => {
      // Create dates for user
      opts.user.registration = new Date();
      opts.user.lastlogin = new Date();
      // Assign role(s) to newly created user
      opts.user.roles = [];
      for (let i = 0; i < roles.length; ++i) {
        // Grant user role by default
        if (roles[i].name === 'user') {
          opts.user.roles.push(roles[i]._id);
        }
        // Grant admin role only if no previous user exists
        if (roles[i].name === 'admin' && opts.firstAccount) {
          opts.user.roles.push(roles[i]._id);
        }
      }
      // Database save for user and its godfather promised to avoid internal errors
      const promises = [];
      // Update godfather with new children and code
      if (godfather) {
        promises.push(new Promise((resolve, reject) => {
          godfather.save(userSaveErr => {
            if (userSaveErr) {
              reject(userSaveErr);
            } else {
              resolve();
            }
          });
        }));
      }
      // Save new user with roles
      promises.push(new Promise((resolve, reject) => {
        opts.user.save(userSaveErr => {
          if (userSaveErr) {
            reject(userSaveErr);
          } else {
            resolve();
          }
        });
      }));
      // Redirect client when all saves are OK
      Promise.all(promises).then(() => {
        // Session cookie expires in one day
        const token = jwt.sign({ id: opts.user.id }, config.secret, { expiresIn: 86400 });
        opts.res.cookie('jwtToken', token, { maxAge: 8640000, httpOnly: true });
        // Send proper redirection after registration
        const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_SUCCESS', { url: '/home' }, opts.user.username);
        opts.res.status(responseObject.status).send(responseObject);
      }).catch(userSaveErr => {
        const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_SAVE', {}, userSaveErr);
        opts.res.status(responseObject.status).send(responseObject);
      });
    }).catch(args => {
      const responseObject = global.Logger.buildResponseFromCode(args.code, {}, args.err);
      opts.res.status(responseObject.status).send(responseObject);
    });
  });
};


/* Exported methods */


// Public /login template
exports.loginTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /login page');
  res.render('partials/auth/login', { layout: 'auth' });
};


// Login client submission
exports.loginPost = (req, res) => {
  global.Logger.info('Request POST API call on /api/auth/login');
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (!form.username || !form.password) {
    const responseObject = global.Logger.buildResponseFromCode('B_LOGIN_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent missing arguments from request
  if (form.username === '' || form.password === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_LOGIN_MISSING_FIELD', {
      missing: {
        username: !form.username,
        password: !form.password
      }
    });
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Search username/email in database then test password matching
  User.findOne({ username: form.username }).populate('roles', '-__v').exec((userFindErr, user) => {
    // Internal server error when trying to retrieve user from database
    if (userFindErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }
    // Not found by username, try to find user in database by email
    if (!user) {
      global.Logger.info('Did not found a username in database matching the sent login form. Searching for matching email');
      User.findOne({ email: form.username }).populate('roles', '-__v').exec((userFindErr, user) => {
        // Internal server error when trying to retrieve user from database
        if (userFindErr) {
          const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_FIND', {}, userFindErr);
          res.status(responseObject.status).send(responseObject);
          return;
        }
        // User not found either with username or email
        if (!user) {
          const responseObject = global.Logger.buildResponseFromCode('B_USER_NOT_FOUND');
          res.status(responseObject.status).send(responseObject);
          return;
        }
        // User has been found by email, check its password validity
        global.Logger.info('Found an email in database matching the sent login form');
        finalizeLogin({
          req: req,
          res: res,
          user: user,
          form: form,
        });
      })
    } else {
      // User has been found by username, check its password validity
      global.Logger.info('Found a username in database matching the sent login form');
      finalizeLogin({
        req: req,
        res: res,
        user: user,
        form: form,
      });
    }
  });
};


// Public /register template
exports.registerTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /register page');
  res.render('partials/auth/register', { layout: 'auth' });
};


// Register client submission
exports.registerPost = (req, res) => {
  global.Logger.info('Request POST API call on /api/auth/register');
  const form = req.body;
  // Prevent wrong arguments sent to POST
  if (!form.username || !form.email || !form.code || !form.pass1 || !form.pass2) {
    const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_INVALID_FIELD');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Prevent missing arguments from request
  if (form.username === '' || form.email === '' || form.code === '' || form.pass1 === '' || form.pass2 === '') {
    const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_MISSING_FIELD', {
      missing: {
        username: !form.username,
        email: !form.email,
        code: !form.code,
        pass1: !form.pass1,
        pass2: !form.pass2
      }
    });
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Password matching verification
  if (form.pass1 !== form.pass2) {
    const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_DIFFERENT_PASSWORDS');
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Password length matching auth config length
  if (form.pass1.length < config.passwordLength) {
    const responseObject = global.Logger.buildResponseFromCode('B_REGISTER_PASSWORD_TOO_SHORT', {}, config.passwordLength);
    res.status(responseObject.status).send(responseObject);
    return;
  }
  // Create user from model with form info
  const user = new User({
    username: form.username,
    email: form.email,
    code: utils.genInviteCode(),
    password: bcrypt.hashSync(form.pass1, 8),
    depth: 0, // Init with depth 0, updated later in godfather checks
  });
  // Check whether it's first register or not by counting item in User table
  User.countDocuments({}, (userCountErr, count) => {
    if (userCountErr) {
      const responseObject = global.Logger.buildResponseFromCode('B_INTERNAL_ERROR_USER_COUNT', {}, userCountErr);
      res.status(responseObject.status).send(responseObject);
      return;
    }
    // Finalize registration
    finalizeRegistration({
      res: res,
      user: user,
      form: form,
      firstAccount: (count === 0)
    });
  });
};


// Logout redirection url -> clear cookies and redirect to public homepage
exports.logout = (req, res) => {
  global.Logger.info('Request /logout action');
  res.clearCookie('jwtToken');
  res.redirect(302, '/');
};
