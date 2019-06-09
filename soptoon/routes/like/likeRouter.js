var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/authUtils');
const db = require('../../module/pool');

router.post('/:webtoonIdx', utils.isLoggedin, async(req, res) => {
    if(req.decoded)
    {
        console.log(req.decoded)
        const selectLikeQuery = 'SELECT * FROM likes WHERE webtoonIdx = ? AND userIdx = ?'
        if (!req.params.webtoonIdx || !req.decoded.userIdx)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE))
        }
        else{
            const likes = await db.queryParam_Parse(selectLikeQuery, [req.params.webtoonIdx, req.decoded.userIdx]);
            if (!likes) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.LIKE_SELECT_FAIL));
            } 
            else if(likes.length == 1)
            {
                const deleteLikeQuery = 'DELETE FROM likes WHERE webtoonIdx = ? AND userIdx = ?'
                const updateLikeCountQuery = 'UPDATE webtoon SET likeCount = likeCount - 1 WHERE webtoonIdx= ?'
                const deleteTransaction = await db.Transaction(async(connection) => {
                    await connection.query(deleteLikeQuery, [req.params.webtoonIdx, req.decoded.userIdx]);
                    await connection.query(updateLikeCountQuery, [req.params.webtoonIdx]);
                })
                if (!deleteTransaction) {
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.LIKE_TRANSAC_FAIL));
                } else {
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LIKE_TRANSAC_SUCCESS));
                }   
            }
            else
            {
                const InsertLikeQuery = 'INSERT INTO likes (webtoonIdx, userIdx) VALUES (?, ?)'
                const updateLikeCountQuery = 'UPDATE webtoon SET likeCount = likeCount + 1 WHERE webtoonIdx= ?'
                const insertTransaction = await db.Transaction(async(connection) => {
                    await connection.query(InsertLikeQuery, [req.params.webtoonIdx, req.decoded.userIdx]);
                    await connection.query(updateLikeCountQuery, [req.params.webtoonIdx]);
                })
                if (!insertTransaction) {
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.LIKE_TRANSAC_FAIL));
                } else {
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LIKE_TRANSAC_SUCCESS));
                }
            }
        }
    }
})

module.exports = router;