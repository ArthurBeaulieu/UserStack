const path = require('path');
const handlebars = require('express-handlebars').create();


const _getPath = (dir, file) => {
  return path.join(__dirname, `../views/${dir}/${file}.handlebars`);
};


// Private template (for authenticated users), /template/modal/delete/user
exports.deleteUserModal = (req, res) => {
  global.log.info('Request template for the /template/modal/delete/user page as string');
  handlebars.renderView(_getPath('partials/modal', 'userdelete'), {
    layout: _getPath('layouts', 'modal')
  }).then(htmlString => {
    global.log.info('Rendering template for the /template/modal/delete/user page as string');
    res.status(200).send(htmlString);
    console.log(htmlString)
  }).catch(err => {
    console.log(err);
  });
};
