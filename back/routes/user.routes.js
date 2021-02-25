const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/user.controller');


module.exports = app => {
  app.get('/profile', [authMiddleware.verifyToken], controller.profileTemplate);
  app.get('/profile/edit', [authMiddleware.verifyToken], controller.profileEditTemplate);

  app.get('/api/user/delete', [authMiddleware.verifyToken], controller.delete);
  app.post('/api/user/delete', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.delete);
  app.post('/api/user/update/info', [authMiddleware.verifyToken], controller.updateInfo);
  app.post('/api/user/update/role', [authMiddleware.verifyToken], controller.updateRole);
  app.post('/api/user/update/password', [authMiddleware.verifyToken], controller.updatePassword);

  app.get('/api/test/all', controller.allAccess);
  app.get('/api/test/user', [authMiddleware.verifyToken], controller.userBoard);
  app.get('/api/test/mod', [ authMiddleware.verifyToken, authMiddleware.isModerator ], controller.moderatorBoard);
  app.get('/api/test/admin', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminBoard);
};
