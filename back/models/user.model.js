const mongoose = require('mongoose');


const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  code: String,
  password: String,
  registration: Date,
  lastlogin: Date,
  parent: mongoose.Schema.Types.ObjectId,
  children: [],
  depth: Number,
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }]
}));


module.exports = User;
