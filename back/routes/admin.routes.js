const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/admin.controller');


module.exports = app => {
  app.get('/admin', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminTemplate);
  app.get('/admin/users', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminUsersTemplate);
};
