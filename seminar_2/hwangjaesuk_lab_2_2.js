const http  = require('http');
const request = require('request');
const fs = require('fs');
const json2csv = require('json2csv');
const csv = require('csvtojson');

const server = http.createServer((req, res)=> {
    const option = {
        url: "http://15.164.75.18:3000/homework/2nd",
        method: "GET"
    };

    request(option, (err, response, body)=> {
        const data = JSON.parse(body).data;

        const resultCsv = json2csv.parse({
            data: data
        });
        fs.writeFile('info.csv', resultCsv, (err) => {
            if (err){
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: "failed to write a file"}));
            }
            else {
                csv().fromFile('./info.csv').then((jsonObj) => {
                    res.write(JSON.stringify(jsonObj));
                    res.end();
                })
            }
        });
    })
}).listen(3000, () => {
    console.log("서버 3000포트로 열기");
})