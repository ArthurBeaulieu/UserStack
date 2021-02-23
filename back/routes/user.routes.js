const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/user.controller');


module.exports = mzk => {
  mzk.get('/profile', [authMiddleware.verifyToken], controller.profileTemplate);
  mzk.get('/profile/edit', [authMiddleware.verifyToken], controller.profileEditTemplate);

  mzk.get('/api/user/delete', [authMiddleware.verifyToken], controller.delete);
  mzk.post('/api/user/delete', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.delete);
  mzk.post('/api/user/update/info', [authMiddleware.verifyToken], controller.updateInfo);
  mzk.post('/api/user/update/role', [authMiddleware.verifyToken], controller.updateRole);
  mzk.post('/api/user/update/password', [authMiddleware.verifyToken], controller.updatePassword);

  mzk.get('/api/test/all', controller.allAccess);
  mzk.get('/api/test/user', [authMiddleware.verifyToken], controller.userBoard);
  mzk.get('/api/test/mod', [ authMiddleware.verifyToken, authMiddleware.isModerator ], controller.moderatorBoard);
  mzk.get('/api/test/admin', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminBoard);
};
