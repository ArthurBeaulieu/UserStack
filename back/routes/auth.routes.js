const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/auth.controller');


module.exports = app => {
  app.get('/login', controller.loginTemplate);
  app.get('/register', controller.registerTemplate);
  app.get('/logout', [authMiddleware.isLoggedIn], controller.logout);

  app.post('/api/auth/login', controller.loginPost);
  app.post('/api/auth/register', [authMiddleware.checkDuplicateUsernameOrEmail], controller.registerPost);
};
