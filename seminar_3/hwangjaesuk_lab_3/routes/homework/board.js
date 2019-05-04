const csv = require('csvtojson');
var express = require('express');
var router = express.Router();
const jsontocsv = require('json2csv').parse;
const fs = require('fs');
const crypto = require('crypto');


router.get('/board/:id', function(req, res, next) {
    let id = req.params.id;
    let signal;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            signal = 1;
            const data = {'id': article.id, 'title': article.title, 'content': article.content}
            res.send(data);
        }
    })    
    if(signal == undefined )     
        res.send('no data contains this id');
    })
});


router.post('/board', function(req, res, next) {
    id = req.body.id;
    const title = req.body.title;
    const content = req.body.content;
    const password = req.body.password;
    var salt;
    var hashedStr;

    if(!title || !content || !password || !id)
    {
        res.send("id or title or content or password is required");
    }
    else
    {
        crypto.randomBytes(32, (err, buf) => {
            if(err) {
                res.send("random string was not made");
            }else {
                salt = buf.toString('base64');
                crypto.pbkdf2(password, salt, 10 , 32, 'SHA512', (err, result) => {
                    if (err) {
                        res.send("failure to make encryption");
                    } else {
                        hashedStr = result.toString('base64');
                    }
                })
            }
        })

        csv()
        .fromFile('./database/article.csv')
        .then(function(articleData){
                const data = {"id":id, "title": title, "content": content, "createdTime": new Date().toISOString().slice(0,10).replace(/-/g,""),
                "password": hashedStr, "salt": salt};
                articleData.push(data);
                const csv = jsontocsv(articleData, { fields: ["id","title","content","createdTime","password","salt"]});
                fs.writeFileSync('./database/article.csv', csv, {encoding:'utf8',flag:'w'});
                res.send("data is saved");
        })
    }
});


router.put('/board', function(req, res, next) {
    const id = req.query.id;
    const password = req.query.password;
    const title = req.body.title;
    const content = req.body.content;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            signal = 1;
            crypto.pbkdf2(password, article.salt, 10 , 32, 'SHA512', (err, result) => {
                if(result.toString('base64') === article.password)
                {
                    if(title)
                    article.title = title;
                    if(content)
                    article.content = content;
                    const csv = jsontocsv(articleData, { fields: ["id","title","content","createdTime","password","salt"]});
                    fs.writeFileSync('./database/article.csv', csv, {encoding:'utf8',flag:'w'});
                    res.send("data is updated");
                }
                else{
                    res.send("incorrect password");
                }
                }
            )
        }
    })    
    if(signal == undefined )     
        res.send('no data contains this id');
    })
});


router.delete('/board', function(req, res, next) {
    const id = req.query.id;
    const password = req.query.password;
    let signal;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            signal = 1;
            crypto.pbkdf2(password, article.salt, 10 , 32, 'SHA512', (err, result) => {
                if(result.toString('base64') === article.password)
                {
                    articleData.splice(index, 1);
                    const csvData = jsontocsv(articleData, { fields: ["id","title","content","createdTime","password","salt"]});
                    fs.writeFileSync('./database/article.csv', csvData, {encoding:'utf8',flag:'w'});
                    res.send("data is deleted");
                }
                else{
                    res.send("incorrect password");
                }
                }
            )
        }
    })    
    if(signal == undefined )     
        res.send('no data contains this id');
    })
});


module.exports = router;
