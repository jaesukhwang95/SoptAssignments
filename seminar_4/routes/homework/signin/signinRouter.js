var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const crypto = require('crypto-promise');

router.post('/', async(req, res) => {
    try{
        const getUserWithSameIdQuery = 'SELECT * FROM user WHERE id = ?';
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
                    id: resultUser[0].id,
                    name: resultUser[0].name
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