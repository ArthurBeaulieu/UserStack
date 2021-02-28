const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/user.controller');


module.exports = app => {
  app.get('/profile', [authMiddleware.isLoggedIn], controller.profileTemplate);
  app.get('/profile/edit', [authMiddleware.isLoggedIn], controller.profileEditTemplate);

  app.get('/api/user/delete', [authMiddleware.isLoggedIn], controller.delete); // User want to remove its account
  app.post('/api/user/delete', [authMiddleware.isLoggedIn, authMiddleware.isAdmin], controller.delete); // Admin remove user account
  app.post('/api/user/update/info', [authMiddleware.isLoggedIn], controller.updateInfo);
  app.post('/api/user/update/role', [authMiddleware.isLoggedIn], controller.updateRole);
  app.post('/api/user/update/password', [authMiddleware.isLoggedIn], controller.updatePassword);
};
