var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var table = new Schema({
    ip: String,
    pais: String,
    cidade: String,
    regiao: String,
    lat: String,
    lon: String,
    org: String,
    dta_acesso: String,
    views: Number   
},{collection:'controle_ip'});

var schema_ip = mongoose.model("schema_ip", table);

module.exports = schema_ip;