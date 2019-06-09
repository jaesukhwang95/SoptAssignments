var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/authUtils');
const db = require('../../module/pool');
const upload = require('../../config/multer');
const moment = require('moment');
const dataFilter = require('../../module/utils/dataFilter');

router.get('/:webtoonIdx/:episodeIdx', async(req, res) => {
    const getCommentsWithSameEpisodeIdxQuery = 'SELECT * FROM comment LEFT JOIN user ON comment.userIdx = user.userIdx' + 
    ' WHERE comment.webtoonIdx = ? AND comment.episodeIdx = ?';
    const comments = await db.queryParam_Parse(getCommentsWithSameEpisodeIdxQuery, [req.params.webtoonIdx, req.params.episodeIdx] );
    if (comments.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.COMMENT_SELECT_FAIL));
    } else {
        console.log(comments)
        let commentsArr = []
        comments.forEach((rawComment) => {
        commentsArr.push(dataFilter.commentFilter(rawComment));
        });
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.COMMENT_SELECT_SUCCESS, commentsArr));
    }
})

router.get('/count/:webtoonIdx/:episodeIdx', async(req, res) => {
    const getCommentsCountQuery = 'SELECT COUNT(*) AS commentsCount FROM comment WHERE comment.webtoonIdx = ? AND comment.episodeIdx =?;';
    const commentsCount = await db.queryParam_Parse(getCommentsCountQuery, [req.params.webtoonIdx, req.params.episodeIdx] );
    if (commentsCount.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.COMMENTSCOUNT_SELECT_FAIL));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.COMMENTSCOUNT_SELECT_SUCCESS, commentsCount));
    }
})

router.post('/:webtoonIdx/:episodeIdx', upload.single('commentImg'), utils.isLoggedin, async (req, res) => {
    const content = req.body.content;
    const webtoonIdx = req.params.webtoonIdx;
    const episodeIdx = req.params.episodeIdx;
    const createdTime = moment().format('YYYY-MM-DD hh:mm:ss');
    const commentImg = req.file;
    if(req.decoded)
    {
        if(!content || !webtoonIdx || !episodeIdx || !commentImg)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        }
        else 
        {
            const image = commentImg.location;
            const insertCommentQuery = 'INSERT INTO comment (createdTime, content, image, episodeIdx, userIdx, webtoonIdx)' +
            ' VALUES (?, ?, ?, ?, ?, ?)';
            const updateCommentsCountQuery = 'UPDATE episode SET commentsCount = commentsCount+1 WHERE episode.webtoonIdx = ? AND episode.episodeIdx = ?';
            const insertTransaction = await db.Transaction(async(connection) => {
                await connection.query(insertCommentQuery, [createdTime, content, image, episodeIdx, req.decoded.userIdx, webtoonIdx]);
                await connection.query(updateCommentsCountQuery, [req.params.webtoonIdx, req.params.episodeIdx]);
            })
            if (!insertTransaction) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.COMMENT_TRANSAC_FAIL));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.COMMENT_TRANSAC_SUCCESS));
            }
        }
    }
});

module.exports = router;