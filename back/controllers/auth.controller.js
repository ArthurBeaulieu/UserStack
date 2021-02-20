const config = require('../config/auth.config');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const User = db.user;
const Role = db.role;


const genInviteCode = () => {
  return crypto.randomBytes(20).toString('hex').toUpperCase();
};


const insertNewUser = opts => {
  if (opts.firstAccount && opts.form.code !== 'GGJESUS') {
    global.Logger.warn('Register submission is refused because invite code is invalid');
    opts.res.status(400).send({
      status: 400,
      code: 'B_REGISTER_INVALID_CODE',
      message: 'The provided invitation code is invalid or expired.'
    });
    return;
  }
  // Search for existing parent
  User.findOne({ code: opts.form.code }, (userFindErr, godfather) => {
    const stopExec = global.Logger.reqError({
      res: opts.res,
      code: 'B_INTERNAL_ERROR_USER_FIND',
      err: userFindErr
    });
    if (stopExec) { return; }
    // User hierarchy update if not first register on app
    if (!opts.firstAccount) {
      // First account invite code is handle before
      if (!godfather) {
        // Invite code is invalid
        global.Logger.warn('Register submission is refused because invite code is invalid');
        opts.res.status(400).send({
          status: 400,
          code: 'B_REGISTER_INVALID_CODE',
          message: 'The provided invitation code is invalid or expired.'
        });
        return;
      } else {
        // Update new user and its godfather information
        global.Logger.info(`Updating ${godfather.username} invite code and add ${opts.user.username} to children list`);
        godfather.code = genInviteCode();
        godfather.children.push(opts.user._id);
        godfather.save(godfatherUpdateError => { if (godfatherUpdateError) { console.error(godfatherUpdateError); }});
        opts.user.depth = godfather.depth + 1;
        opts.user.parent = godfather._id;
        if (opts.user.depth >= config.maxDepth) {
          // Remove invite code is max depth is reached
          opts.user.code = '';
        }
      }
    }
    // Retrieve roles from model
    Role.find({ name: ['user', 'admin'] }, (roleFindErr, roles) => {
      const stopExec = global.Logger.reqError({
        res: opts.res,
        code: 'B_INTERNAL_ERROR_ROLE_FIND',
        err: roleFindErr
      });
      if (stopExec) { return; }
      opts.user.registration = new Date();
      // Create super user if no previous user in database
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
      // Update user with roles
      opts.user.save(userUpdateErr => {
        const stopExec = global.Logger.reqError({
          res: opts.res,
          code: 'B_INTERNAL_ERROR_USER_SAVE',
          err: userUpdateErr
        });
        if (stopExec) { return; }
        const token = jwt.sign({ id: opts.user.id }, config.secret, {
          expiresIn: 86400
        });
        // Cookie expires in one day
        opts.res.cookie('jwtToken', token, { maxAge: 8640000, httpOnly: true });
        global.Logger.info(`Register submission for ${opts.user.username} is successful`);
        opts.res.status(200).send({
          status: 200,
          code: 'B_REGISTER_SUCCESS',
          url: '/'
        });
      });
    });
  });
};


const finalizeLogin = opts => {
  if (!bcrypt.compareSync(opts.form.password, opts.user.password)) {
    global.Logger.warn('Login submission is refused because password does not match the provided user');
    opts.res.status(401).send({
      status: 401,
      code: 'B_LOGIN_INVALID_PASSWORD',
      message: 'Provided password is invalid for user.'
    });
    return;
  }

  const token = jwt.sign({ id: opts.user.id }, config.secret, {
    expiresIn: 86400
  });
  // Cookie expires in one day
  opts.res.cookie('jwtToken', token, { maxAge: 8640000, httpOnly: true });
  global.Logger.info(`Login submission for ${opts.user.username} is successful`);
  opts.res.status(200).send({
    status: 200,
    code: 'B_LOGIN_SUCCESS',
    url: '/'
  });
};


/* Exported methods */


exports.loginPost = (req, res) => {
  global.Logger.info('Request POST API call on /api/auth/login');
  const form = req.body;
  // Prevent missing arguments from request
  if (form.username === '' || form.password === '') {
    global.Logger.warn('Login submission is refused because some fields are not filled');
    res.status(400).send({
      status: 400,
      code: 'B_LOGIN_MISSING_FIELD',
      message: 'One or several field are empty. Please fill them all before submitting your login.',
      missing: {
        username: !form.username,
        password: !form.password
      }
    });
    return;
  }
  // Search username/email in database then test password matching
  User.findOne({ username: form.username }).populate('roles', '-__v').exec((userFindErr1, user) => {
    const stopExec = global.Logger.reqError({
      res: res,
      code: 'B_INTERNAL_ERROR_USER_FIND',
      err: userFindErr1
    });
    if (stopExec) { return; }
    // Not found by username, try to find user in database by email
    if (!user) {
      User.findOne({ email: form.username }).populate('roles', '-__v').exec((userFindErr2, user) => {
        const stopExec = global.Logger.reqError({
          res: res,
          code: 'B_INTERNAL_ERROR_USER_FIND',
          err: userFindErr2
        });
        if (stopExec) { return; }
        // Not found either with username or email
        if (!user) {
          global.Logger.warn('Login submission is refused because the provided username or email is not registered.');
          res.status(404).send({
            status: 404,
            code: 'B_LOGIN_USER_NOT_FOUND',
            message: 'No user registered for username or email.'
          });
          return;
        }
        // User has been found by email, check its password validity
        finalizeLogin({
          req: req,
          res: res,
          user: user,
          form: form,
        });
      })
    } else {
      // User has been found by username, check its password validity
      finalizeLogin({
        req: req,
        res: res,
        user: user,
        form: form,
      });
    }
  });
};


exports.loginTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /login page');
  res.render('partials/auth/login', { layout: 'auth' });
};


exports.registerPost = (req, res) => {
  global.Logger.info('Request POST API call on /api/auth/register');
  const form = req.body;
  // Prevent missing arguments from request
  if (form.username === '' || form.email === '' || form.code === '' || form.pass1 === '' || form.pass2 === '') {
    global.Logger.warn('Register submission is refused because some fields are not filled');
    res.status(400).send({
      status: 400,
      code: 'B_REGISTER_MISSING_FIELD',
      message: 'One or several field are empty. Please fill them all before submitting your registration.',
      missing: {
        username: !form.username,
        email: !form.email,
        code: !form.code,
        pass1: !form.pass1,
        pass2: !form.pass2
      }
    });
    return;
  }
  // Password matching verification
  if (form.pass1 !== form.pass2) {
    global.Logger.warn('Register submission is refused because passwords do not match');
    res.status(400).send({
      status: 400,
      code: 'B_REGISTER_DIFFERENT_PASSWORDS',
      message: 'The two provided passwords are not matching.'
    });
    return;
  }
  // Password length matching auth config length
  if (form.pass1.length < config.passwordLength) {
    global.Logger.warn('Register submission is refused because password has less than 8 characters');
    res.status(400).send({
      status: 400,
      code: 'B_REGISTER_PASSWORD_TOO_SHORT',
      message: `Password must be at least ${config.passwordLength} characters`
    });
    return;
  }
  // Create user from model with form info
  const user = new User({
    username: form.username,
    email: form.email,
    code: genInviteCode(),
    password: bcrypt.hashSync(form.pass1, 8),
    depth: 0, // Init with depth 0, updated later in godfather checks
  });
  // Check whether it's first register or not by counting item in User table
  User.countDocuments({}, (countErr, count) => {
    const stopExec = global.Logger.reqError({
      res: res,
      code: 'B_INTERNAL_ERROR_USER_COUNT',
      err: countErr
    });
    if (stopExec) { return; }
    insertNewUser({
      res: res,
      user: user,
      form: form,
      firstAccount: (count === 0)
    });
  });
};


exports.registerTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /register page');
  res.render('partials/auth/register', { layout: 'auth' });
};


exports.logout = (req, res) => {
  global.Logger.info('Request /logout action');
  res.clearCookie('jwtToken');
  res.redirect(302, '/login');
};
