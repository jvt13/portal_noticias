const schema_ip = require('./bd/schema_ip.js');
var dta = new Date();

function insert(dados) {
    try {
        dados = dados.map(function (val) {
            //console.log("IP:" + val.ip);
            //console.log("Pais:" + val.pais);
            //console.log("Cidade:" + val.cidade);
            //console.log("Organização:" + val.org);

            schema_ip.create({
                ip: "" + val.ip,
                pais: "" + val.pais,
                cidade: "" + val.cidade,
                regiao: "" + val.regiao,
                lat: "" + val.lat,
                lon: "" + val.lon,
                org: "" + val.org,
                dta_acesso: "" + dta.getUTCDate() + "/" + (dta.getUTCMonth() + 1) + "/" + dta.getUTCFullYear(),
                views: "" + 1
            })
        });
    } catch (error) {
        console.log("Error2222222:" + error);
        //dados = ip.getIP();
    }
}

function busca(cur_ip, dados) {
    dta_atual = dta.getUTCDate() + "/" + (dta.getUTCMonth() + 1) + "/" + dta.getUTCFullYear();
    console.log("HOJE:" + dta_atual);

    schema_ip.findOneAndUpdate({ ip: cur_ip, dta_acesso: dta_atual }, { $inc: { views: 1 } }, { new: true }, function (err, resposta) {
        //console.log("Resposta:"+resposta);

        if (resposta != null) {
            console.log("O IP " + cur_ip + " já existe na data de hoje, o views irá contabilizar +1");
        } else {
            console.log("O IP " + cur_ip + " não existe, porém será criar na tabela.");
            insert(dados);
        }

    });

}

module.exports = { insert, busca };