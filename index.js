const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');

const app = express();
var porta = 5000;

var conexao = require('./services/bd/conexao.js');
const Posts = require('./services/bd/Posts.js');
const Users = require('./services/bd/users.js');
const Serv_download = require('./services/download.js');
const trataIP = require('./services/trataIP.js');

var dta = new Date();
var minutos = null;

var session = require('express-session');

app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

let dados = null;
let url = 'http://ip-api.com/json';
let request = require('request');
var ret = null;

request(url, function (err, response, body) {
    if (err) {
        console.log('error:', err);
    } else {
        let ipInfo = JSON.parse(body);
        dados = [{
            ip: `${ipInfo.query}`,
            pais: `${ipInfo.country}`,
            cidade: `${ipInfo.city}`,
            regiao: `${ipInfo.regionName}`,
            lat: `${ipInfo.regionName}`,
            lon: `${ipInfo.regionName}`,
            org: `${ipInfo.org}`
        }];
    }
});

app.get('/', (req, res) => {

    if(dta.getMinutes() != minutos){
        console.log("IP:" + dados[0].ip + "|Len:" + dados.length+"-"+dta.getMinutes());
        trataIP.busca(dados[0].ip,dados);
        minutos = dta.getMinutes();
    }else{
        minutos = null;
    }

    if (req.query.busca == null) {
        Posts.find({}).sort({ '_id': -1 }).exec(function (err, posts) {
            //console.log(posts[0]);
            posts = posts.map(function (val) {
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 250),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })

            Posts.find({}).sort({ 'views': -1 }).limit(3).exec(function (err, postsTop) {
                //console.log(posts[0]);
                postsTop = postsTop.map(function (val) {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0, 250),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        autor: val.autor,
                        views: val.views
                    }
                })
                //console.log('Valor:'+ postsTop[0].titulo)   
                res.render('home', { posts: posts, postsTop: postsTop });
            });

        })

    } else {


        Posts.find({ titulo: { $regex: req.query.busca, $options: "i" } }, function (err, posts) {
            console.log(posts)
            res.render('busca', { posts: posts, contagem: posts.length });
        })

        //res.render('busca', {});
    }

});

app.get('/:slug', (req, res) => {
    Posts.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true }, function (err, resposta) {
        console.log(resposta);
        var parametro = req.params.slug;
        //res.render('single', {noticia:resposta});

        if (resposta != null) {

            Posts.find({}).sort({ 'views': -1 }).limit(3).exec(function (err, postsTop) {
                //console.log(posts[0]);
                postsTop = postsTop.map(function (val) {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0, 250),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        autor: val.autor,
                        views: val.views
                    }
                })

                console.log('Valor parametro:' + parametro)
                //console.log('Valor:'+ postsTop[0].titulo)   
                res.render('single', { noticia: resposta, postsTop: postsTop });
            })
        } else {
            res.redirect('/')
        }
    })
})

var usuarios = [
    {
        login: 'jose',
        senha: '123'
    }
]

app.post('/admin/cadastro/', (req, res) => {
    var dta = new Date();
    var name_file = dta.getTime() + ".jpeg";

    Serv_download.download(req.body.url_imagem, name_file);

    Posts.create({
        titulo: "" + req.body.titulo_noticia,
        imagem: "" + name_file,
        categoria: "" + req.body.categoria,
        conteudo: "" + req.body.conteudo,
        slug: "" + req.body.slug,
        autor: "" + req.body.autor,
        dta_cadastro: "" + dta.getUTCDate() + "/" + dta.getUTCMonth() + "/" + dta.getUTCFullYear(),
        fonte: "" + req.body.fonte,
        views: 0
    })

    //res.render('admin-panel', {});
    res.redirect('/admin/login');
}); 

app.post('/admin/login', (req, res) => {
    var validado = "";

    Users.findOne({ user: req.body.login }).exec(function (err, us) {
        if (us.user == req.body.login && us.pass == req.body.senha) {
            validado = us.name;
            req.session.login = us.name;
            res.redirect('/admin/login');
        } else {
            validado = null;
        }
    });
});

app.get('/admin/deletar/:id&:file', (req, res) => {

    //res.send("Parametro é:"+ req.params.id+"|"+req.params.file);
    console.log("Post path:" + req.params.file + "|ID:" + req.params.id);
    Posts.deleteOne({ _id: req.params.id }).then(function () {
        Serv_download.apagarArquivo(req.params.file);
        res.redirect('/admin/login');
    });
});

app.get('/admin/login', (req, res) => {
    console.log("Session:" + req.session.login);
    global.login = req.session.login;

    if (req.session.login == null) {
        res.render('admin-login', {});
    } else {
        //res.render('admin-panel', {});

        Posts.find({}).sort({ _id: -1 }).exec(function (err, posts) {
            //console.log(posts[0]);
            posts = posts.map(function (val) {
                return {
                    id: val._id,
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 250),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                }
            });
            res.render('admin-panel', { posts: posts });
        });

    }

});


app.listen(porta, () => {
    console.log('server rodando na porta ' + porta);
})