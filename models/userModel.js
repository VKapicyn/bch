var mongoose = require('mongoose');

var User = new mongoose.Schema({
    userId: Number,
    chatId: Number,
    login: String,
    password: String,
    userName: String,
    admin: Boolean,
    contracts: [String], //ID созданных контрактов
    lastMenu: String,
})
var userModel = mongoose.model('User', User);
module.exports.userModel = userModel;