const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/admin.controller');


module.exports = mzk => {
  mzk.get('/admin', [authMiddleware.verifyToken], controller.adminTemplate);
};
