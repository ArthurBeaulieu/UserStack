exports.adminTemplate = (req, res) => {
  global.Logger.info('Rendering template for the /admin page');
  res.render('partials/admin/menu', { layout : 'admin' });
};
