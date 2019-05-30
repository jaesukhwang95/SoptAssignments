var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');
const crypto = require('crypto-promise');

router.post('/signup', async(req, res) => {
    var count = 0;
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
                if(user.id == req.body.id)
                {
                    count += 1;
                    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.USER_ALREADY_EXISTS));
                }
            });
            if(count == 0)
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

module.exports = router;