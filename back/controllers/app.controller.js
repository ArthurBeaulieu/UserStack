const UserHelper = require('../helpers/user.helper');


// Public / template
exports.publicHomepageTemplate = (req, res) => {
  global.Logger.info('Request template for the / page');
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
  global.Logger.info(`Search a matching user for id ${req.userId}`);
  UserHelper.get({ id: req.userId }).then(user => {
    global.Logger.info(`Matching user ${user.username} to display the homepage`);
    UserHelper.isAdminUser(user).then(isAdminUser => {
      global.Logger.info('Rendering template for the /home page');
      res.render('partials/home/main', {
        layout : 'home',
        isAdmin: isAdminUser
      });
    }).catch(opts => {
      global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
      res.redirect(302, '/');
    });
  }).catch(opts => {
    global.Logger.buildResponseFromCode(opts.code, {}, opts.err);
    res.redirect(302, '/');
  });
};
