const db = require('../models');
const UserHelper = require('../helpers/user.helper');


const User = db.user;


exports.publicHomepageTemplate = (req, res) => {
  global.Logger.info('Rendering template for the / page');
  UserHelper.isLoggedIn(req).then(isLoggedIn => {
    res.render('partials/index/main', {
      layout : 'index',
      isLoggedIn: isLoggedIn
    });
  });
};


exports.homepageTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /home page');
  User.findById(req.userId, (userFindErr, user) => {
    UserHelper.isAdminUser(user).then(isAdminUser => {
      res.render('partials/home/main', {
        layout : 'home',
        isAdmin: isAdminUser
      });
    }).catch(() => {
      res.redirect(302, '/');
    });
  });
};
