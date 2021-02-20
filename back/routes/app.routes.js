const { authMiddleware } = require('../middlewares');


module.exports = mzk => {
  mzk.get('/', [authMiddleware.verifyToken], (req, res) => {
    global.Logger.info('Rendering template for the / page');
    res.render('main', { layout : 'index' });
  });
};
