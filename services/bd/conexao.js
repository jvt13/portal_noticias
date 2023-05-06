const mongoose = require('mongoose');
var data_base = "portal_noticias";

mongoose.connect('mongodb+srv://root:102030@cluster0.jaybk0n.mongodb.net/'+data_base+'?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(function () {
    console.log('Conectado ao MongoDB com sucesso! '+data_base);
}).catch(function (err) {
    console.log(err.message);
})

module.exports ={mongoose};