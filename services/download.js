const fs = require('fs');
const https = require('https');
const path = require('path');

async function download(url, name_file) {
    https.get(url, (res) => {
        const data = new Date();
        // Image will be stored at this path
        const path = __dirname + "/../public/imagens/" + name_file;
        global.url_imagem_download = name_file;
        const filePath = fs.createWriteStream(path);
        res.pipe(filePath);
        filePath.on('finish', () => {
            filePath.close();
            console.log('Download Completed');
        });
    });
}
//var url = "https://cdn.pixabay.com/photo/2018/07/31/22/08/lion-3576045__480.jpg"

async function apagarArquivo(file) {
    const path = __dirname + "/../public/imagens/"+file;
    console.log("File:"+path);
    fs.unlink(path, function (err){
        if (err) throw err;
        console.log('Arquivo deletado!');
    })
}

module.exports = {download, apagarArquivo};