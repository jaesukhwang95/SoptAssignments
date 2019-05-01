const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    if(req.url=='/favicon.ico')
    {
        //favicon;
    }
    else{
        const urlParsed = url.parse(req.url);
        const queryParsed = querystring.parse(urlParsed.query);
        str = querystring.stringify(queryParsed).split('=')[1];
        console.log(str);
        crypto.randomBytes(32, (err, buf) => {
            if(err) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: "random string was not made"}));
            }else {
                const salt = buf.toString('base64');
                crypto.pbkdf2(str, salt, 10 , 32, 'SHA512', (err, result) => {
                    if (err) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ msg: "failure to make encryption"}));
                    } else {
                        const hashedStr = result.toString('base64');
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ msg: "success", hashed : hashedStr }));
                    }
                })
            }
        })
    }
}).listen(3000, ()=> {
    console.log("3000포트로 접속");
})
