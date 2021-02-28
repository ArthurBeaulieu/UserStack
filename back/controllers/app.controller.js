const UserHelper = require('../helpers/user.helper');


// Public / template
exports.publicHomepageTemplate = (req, res) => {
  UserHelper.isLoggedIn(req).then(isLoggedIn => {
    global.Logger.info('Rendering template for the / page');
    res.render('partials/index/main', {
      layout : 'index',
      isLoggedIn: isLoggedIn
    });
  });
};


// Private /home template (for authenticated users)
exports.homepageTemplate = (req, res) => {
  global.Logger.info('Request template for the /home page');
  UserHelper.get({ id: req.userId }).then(user => {
    UserHelper.isAdminUser(user).then(isAdminUser => {
      global.Logger.info('Rendering template for the /home page');
      res.render('partials/home/main', {
        layout : 'home',
        isAdmin: isAdminUser
      });
    }).catch(opts => {
      const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.redirect(responseObject.status, '/');
    });
  }).catch(opts => {
    const responseObject = global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.redirect(responseObject.status, '/');
  });
};
