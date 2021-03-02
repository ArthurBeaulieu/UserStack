const multer = require('multer');


uploadAvatar = (req, res, next) => {
  const upload = multer({
    dest: './assets/img/uploads/tmp'
  }).single('avatar');

  upload(req, res, err => {
    next();
  });
};


module.exports = {
  uploadAvatar
};