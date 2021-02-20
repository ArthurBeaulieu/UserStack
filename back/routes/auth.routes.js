const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/auth.controller');


module.exports = mzk => {
  mzk.post('/api/auth/login', controller.loginPost);
  mzk.get('/login', controller.loginTemplate);

  mzk.post('/api/auth/register', [authMiddleware.checkDuplicateUsernameOrEmail], controller.registerPost);
  mzk.get('/register', controller.registerTemplate);

  mzk.get('/logout', controller.logout);
};
