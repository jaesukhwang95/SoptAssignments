const crypto = require('crypto');
const csv = require('csvtojson');
const fs = require('fs');
const http = require('http');
const { Parser } = require('json2csv');
const querystring = require('querystring');
const request = require('request');
const url = require('url');

const server = http.createServer((req, res) => {
    const urlParsed = url.parse(req.url);
    const queryParsed = querystring.parse(urlParsed.query);
    const id = queryParsed.id;
    const password = queryParsed.pw;

    if(req.url=='/favicon.ico')
    {
        //favicon
    }
    else if(req.url.startsWith("/signin"))
    {
        if(!password)
        {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "do not have password key in query"}));
        }
        else
        {
            crypto.randomBytes(32, (err, buf) => {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: "random string was not made"}));
                } else {
                    const salt = buf.toString('base64');
                    crypto.pbkdf2(password, salt, 10 , 32, 'SHA512', (err, result) => {
                        if (err) {
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ message: "encryption was failed"}));
                        } else {
                            const hashedStr = result.toString('base64');
                            const fields = ['id', 'hashedPassword', 'salt'];
                            const information = [
                                {
                                    "id": id,
                                    "hashedPassword": hashedStr,
                                    "salt": salt
                                }];

                            const json2csvParser = new Parser({ fields });
                            const csv = json2csvParser.parse(information);
                            fs.writeFile('user.csv', csv, (err) => {
                                if (err){
                                    res.writeHead(400, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "failed to write a file"}));
                                } else {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "sign in success"}));
                                }
                            });

                        }
                    })
                }
            })
        }
    }
        else if(req.url.startsWith("/signup"))
        {
            crypto.randomBytes(32, (err, buf) => {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: "random string was not made"}));
                } else {
                    csv().fromFile('./user.csv').then((jsonObj) => {
                        salt = jsonObj[0].salt;
                        hashedPassword = jsonObj[0].hashedPassword;
                        crypto.pbkdf2(password, salt, 10 , 32, 'SHA512', (err, result) => {
                            if (err) {
                                res.writeHead(400, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({ message: "encryption was failed"}));
                            } else {
                                const hashedQuery = result.toString('base64');
                                if(hashedPassword == hashedQuery)
                                {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "sign up success"}));
                                }
                                else
                                {
                                    res.writeHead(400, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "password is wrong"}));
                                }
                            }
                            
                        })
                    })
                }
            })

    }
    else if(req.url.startsWith("/info"))
    {
        const option = {
            url: "http://15.164.75.18:3000/homework/2nd",
            method: "POST",
            form: {
                name:'황재석',
                phone:'010-9959-5668',
            }
        };
        request(option, (err, response, body)=> {
            var data = JSON.parse(body).data;
            var fields = [];
            for( var key in data)  {
                fields.push(key);
            }
            crypto.randomBytes(32, (err, buf) => {
                if(err) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: "random string was not made"}));
                } else {
                    const salt = buf.toString('base64');
                    crypto.pbkdf2(data.phone, salt, 10 , 32, 'SHA512', (err, result) => {
                        if (err) {
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({ message: "encryption was failed"}));
                        } else {
                            data.phone = result.toString('base64');
                            const json2csvParser = new Parser({ fields });
                            const csv = json2csvParser.parse(data);
                            fs.writeFile('myinfo.csv', csv, (err) => {
                                if (err){
                                    res.writeHead(400, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "failed to save data"}));
                                }
                                else {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({ message: "succeeded to save data"}));
                                }
                            });
                        }
                    })
                }
            })
        })
    }
    else
    {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: "No url matched"}));
    }
}).listen(3000, ()=> {
    console.log("3000포트로 접속");
})