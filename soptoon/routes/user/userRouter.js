var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');
const crypto = require('crypto-promise');

router.post('/signup', async(req, res) => {
    var signal = 0;
    if(!req.body.id || !req.body.name || !req.body.password)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const getAllUserQuery = 'SELECT * FROM user';
        const getAllUserResult = await db.queryParam_None(getAllUserQuery);
        if (!getAllUserResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.USER_SELECT_FAIL));
        } else {
            getAllUserResult.forEach((user) => {
                console.log(user)
                if(user.userId == req.body.id)
                {
                    signal += 1;
                    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.USER_ALREADY_EXISTS));
                }
            });
            if(signal == 0)
            {
                const salt = await crypto.randomBytes(32);
                const password = await crypto.pbkdf2(req.body.password, salt.toString('base64'), 1000, 32, 'SHA512');
                const insertUserQuery = 'INSERT INTO user (userId, userName, password, salt) VALUES (?, ?, ?, ?)';
                const insertUserResult = await db.queryParam_Parse(insertUserQuery, [req.body.id, req.body.name, password.toString('base64'), salt.toString('base64')]);
                if (!insertUserResult) {
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.USER_INSERT_FAIL));
                } else { 
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.USER_INSERT_SUCCESS));
                }
            }
        }
    }
})

router.post('/login', async(req, res) => {
    try{
        const getUserWithSameIdQuery = 'SELECT * FROM user WHERE userId = ?';
        let resultUser = await db.queryParam_Parse(getUserWithSameIdQuery, [req.body.id] );
        if(resultUser.length == 0)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.ID_MISS_MATCH));
        }
        else{
            const salt = resultUser[0].salt;
            const password = await crypto.pbkdf2(req.body.password, salt, 1000, 32, 'SHA512');
            if(resultUser[0].password == password.toString('base64'))
            {
                const User = {
                    userIdx: resultUser[0].userIdx,
                    id: resultUser[0].userId,
                    name: resultUser[0].userName
                }
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS, User));
            }
            else{
                res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.PASSWORD_MISS_MATCH));
            } 
        }
    }
    catch(err){
            console.log(err)
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.USER_SELECT_FAIL));
        }
    }
    
)

module.exports = router;