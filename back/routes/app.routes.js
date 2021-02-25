const { authMiddleware } = require('../middlewares');
const controller = require('../controllers/app.controller');


module.exports = mzk => {
  mzk.get('/', controller.publicHomepageTemplate);
  mzk.get('/home', [authMiddleware.verifyToken], controller.homepageTemplate);
};
