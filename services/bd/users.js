var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var table = new Schema({
    name: String,
    user: String,
    pass: Number,
    type: String,
    dta_cad: String
},{collection:'users'});

var users = mongoose.model("Users", table);

module.exports = users;