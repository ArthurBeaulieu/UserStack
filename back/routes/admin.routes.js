const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/admin.controller');


module.exports = mzk => {
  mzk.get('/admin', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminTemplate);
  mzk.get('/admin/users', [authMiddleware.verifyToken, authMiddleware.isAdmin], controller.adminUsersTemplate);
};
