const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/auth.controller');


module.exports = app => {
  app.get('/login', controller.loginTemplate);
  app.post('/api/auth/login', controller.loginPost);

  app.get('/register', controller.registerTemplate);
  app.post('/api/auth/register', [authMiddleware.checkDuplicateUsernameOrEmail], controller.registerPost);

  app.get('/logout', controller.logout);
};
