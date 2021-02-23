const crypto = require('crypto');


exports.genInviteCode = () => {
  return crypto.randomBytes(20).toString('hex').toUpperCase();
};


exports.formatDate = unformattedDate => {
  let d = new Date(unformattedDate);
  if (!unformattedDate) {
    d = new Date();
  }
  const date = `${d.getFullYear()}/${('0' + (d.getMonth() + 1)).slice(-2)}/${('0' + d.getDate()).slice(-2)}`;
  const time = `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
  return `${date} - ${time}`;
};
