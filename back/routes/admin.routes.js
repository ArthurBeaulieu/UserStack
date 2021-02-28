const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/admin.controller');


module.exports = app => {
  app.get('/admin', [authMiddleware.isLoggedIn, authMiddleware.isAdmin], controller.adminTemplate);
  app.get('/admin/users', [authMiddleware.isLoggedIn, authMiddleware.isAdmin], controller.adminUsersTemplate);
};
