const path = require('path');
const i18n = require('i18n');
const handlebars = require('express-handlebars').create();


const _getPath = (dir, file) => {
  return path.join(__dirname, `../views/${dir}/${file}.handlebars`);
};


// Private template (for authenticated users), /template/modal/delete/user
exports.deleteUserModal = (req, res) => {
  global.log.info('Request template for the /template/modal/delete/user page as string');
  const i18nLocale = i18n.getLocale();
  i18n.setLocale(req.getLocale());
  handlebars.render(_getPath('partials/modal', 'userdelete'), i18n, {}).then(htmlString => {
    global.log.info('Rendering template for the /template/modal/delete/user page as string');
    i18n.setLocale(i18nLocale);
    res.status(200).send(htmlString);
  }).catch(err => {
    // TODO handle err
    console.error(err);
  });
};
