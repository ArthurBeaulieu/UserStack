const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/user.controller');


module.exports = app => {
  app.get('/profile', [authMiddleware.verifyToken], controller.profileTemplate);
  app.get('/profile/edit', [authMiddleware.verifyToken], controller.profileEditTemplate);

  app.get('/api/user/delete', [authMiddleware.verifyToken], controller.delete); // User want to remove its account
  app.post('/api/user/delete', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.delete); // Admin remove user account
  app.post('/api/user/update/info', [authMiddleware.verifyToken], controller.updateInfo);
  app.post('/api/user/update/role', [authMiddleware.verifyToken], controller.updateRole);
  app.post('/api/user/update/password', [authMiddleware.verifyToken], controller.updatePassword);
};
