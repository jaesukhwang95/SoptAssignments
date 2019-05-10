const csv = require('csvtojson');
var express = require('express');
var router = express.Router();
const jsontocsv = require('json2csv').parse;
const fs = require('fs');
const crypto = require('crypto');
const responseMessage = require('./../../modules/responseMessage');
const statusCode = require('./../../modules/statusCode');
const utils = require('./../../modules/utils');

router.get('/board/:id', function(req, res, next) {
    let id = req.params.id;
    var count=0;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            count += 1;
            const data = {'id': article.id, 'title': article.title, 'content': article.content}
            res.json(utils.successTrue(statusCode.OK, "게시물 정보 응답", data))
        }
    })    
    if(count == 0)     
        res.json(utils.successFalse(statusCode.NOT_FOUND, responseMessage.OUT_OF_VALUE))
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
        res.json(utils.successFalse(statusCode.NOT_FOUND, responseMessage.NULL_VALUE))
    }
    else
    {
        crypto.randomBytes(32, (err, buf) => {
            if(err) {
                res.json(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, "랜덤바이트 문자열 생성 오류"))
            }else {
                salt = buf.toString('base64');
                crypto.pbkdf2(password, salt, 10 , 32, 'SHA512', (err, result) => {
                    if (err) {
                        res.json(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, "암호화 실패"))
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
                res.json(utils.successTrue(statusCode.CREATED, responseMessage.CREATED_ARTICLE, data));
        })
    }
});


router.put('/board', function(req, res, next) {
    const id = req.body.id;
    const password = req.body.password;
    const title = req.body.title;
    const content = req.body.content;
    var count = 0;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            count += 1; 
            crypto.pbkdf2(password, article.salt, 10 , 32, 'SHA512', (err, result) => {
                if(result.toString('base64') === article.password)
                {
                    if(title)
                    article.title = title;
                    if(content)
                    article.content = content;
                    const csv = jsontocsv(articleData, { fields: ["id","title","content","createdTime","password","salt"]});
                    fs.writeFileSync('./database/article.csv', csv, {encoding:'utf8',flag:'w'});
                    res.json(utils.successTrue(statusCode.OK, responseMessage.UPDATED_ARTICLE, article));
                }
                else{
                    res.json(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
                }
                }
            )
        }
    })
    if(count == 0)     
    res.json(utils.successFalse(statusCode.NOT_FOUND, responseMessage.OUT_OF_VALUE));

    })
    .catch(function (err) {
        console.error(err);
    });
});


router.delete('/board', function(req, res, next) {
    const id = req.body.id;
    const password = req.body.password;
    var count = 0;
    csv()
    .fromFile('./database/article.csv')
    .then(function(articleData){
        articleData.forEach(function (article, index, array) {
        if(article.id == id)
        {
            count += 1;
            crypto.pbkdf2(password, article.salt, 10 , 32, 'SHA512', (err, result) => {
                if(result.toString('base64') === article.password)
                {
                    articleData.splice(index, 1);
                    const csvData = jsontocsv(articleData, { fields: ["id","title","content","createdTime","password","salt"]});
                    fs.writeFileSync('./database/article.csv', csvData, {encoding:'utf8',flag:'w'});
                    res.json(utils.successTrue(statusCode.NO_CONTENT, "게시물 삭제 완료"));
                }
                else{
                    res.json(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
                    }
                }
            )
        }
    })    
    if(count == 0)  
        res.json(utils.successFalse(statusCode.NOT_FOUND, responseMessage.OUT_OF_VALUE));
    })
    .catch(function (err) {
        console.error(err);
    });
});


module.exports = router;
