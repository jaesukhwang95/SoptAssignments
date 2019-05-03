const csv = require('csvtojson');
var express = require('express');
var router = express.Router();
const crypto = require('crypto-promise')
const jsontocsv = require('json2csv').parse;
const fs = require('fs');
require('dotenv').config();


router.get('/info/:id', function(req, res, next) {
    let id = req.params.id;
    let data;
    csv()
    .fromFile('./database/info.csv')
    .then(function(studentData){
        studentData.forEach(function (info, index, array) {
        if(info.studentNumber == id)
        {
            data = {'name': info.name, 'studentNumber': info.studentNumber, 'university': info.university, 'major': info.major};
            res.send(data);
        }
    })    
    if(data == undefined )     
        res.send('no data contains this id');
    })
});

router.post('/info', function(req, res, next) {
    const age = req.body.age;
    const name = req.body.name;
    const studentNumber = req.body.studentNumber;
    const university = req.body.university;
    let major = req.body.major;
    if( name == '' || studentNumber == '' || name == undefined || studentNumber == undefined )
        res.send('no student number or no name');
    else{
        const cipher = async () => {
            const cipher = await crypto.cipher('aes256', process.env.CIPHER_SECRET_KEY)(age);
            cipheredAge = cipher.toString('hex'); 
        }
        cipher();
        csv()
            .fromFile('./database/info.csv')
            .then(function(studentData){
                    const data = { "name": name, "studentNumber": studentNumber, "university": university, "major": major, "age": cipheredAge }
                    studentData.push(data);
                    const csv = jsontocsv(studentData, { fields: ["name", "studentNumber","university","major","age"]});
                    fs.writeFileSync('./database/info.csv', csv, {encoding:'utf8',flag:'w'});
                    res.send("data is saved");
            })
    }
});
module.exports = router;
