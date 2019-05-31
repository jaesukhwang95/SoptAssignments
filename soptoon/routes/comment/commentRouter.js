var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');
const upload = require('../../config/multer');
const moment = require('moment');

router.get('/:webtoonIdx/:episodeIdx', async(req, res) => {
    const getCommentsWithSameEpisodeIdxQuery = 'SELECT * FROM comment LEFT JOIN user ON comment.userIdx = user.userIdx' + 
    ' WHERE comment.webtoonIdx = ? AND comment.episodeIdx = ?';
    const comments = await db.queryParam_Parse(getCommentsWithSameEpisodeIdxQuery, [req.params.webtoonIdx, req.params.episodeIdx] );
    if (comments.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.COMMENT_SELECT_FAIL));
    } else {
        console.log(comments)
        const commentFilter = (rawData) => {
            FilteredComments = {
                "commentIdx": rawData.commentIdx,
                "content": rawData.content,
                "createdTime": rawData.createdTime,
                "userName": rawData.userName,
                "image": rawData.image
            }
            return FilteredComments;
        }
        let commentsArr = []
        comments.forEach((rawComment) => {
        commentsArr.push(commentFilter(rawComment));
        });
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.COMMENT_SELECT_SUCCESS, commentsArr));
    }
})

router.post('/:webtoonIdx/:episodeIdx', upload.single('commentImg'), async(req, res) => {
    const content = req.body.content;
    const webtoonIdx = req.params.webtoonIdx;
    const episodeIdx = req.params.episodeIdx;
    const createdTime = moment().format('YYYY-MM-DD hh:mm:ss');
    const commentImg = req.file;
    if(!content || !webtoonIdx || !episodeIdx || !commentImg)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const image = commentImg.location;
        const insertCommentQuery = 'INSERT INTO comment (createdTime, content, image, episodeIdx, userIdx, webtoonIdx)' +
        'VALUES (?, ?, ?, ?, ?, ?)';
        const insertCommentResult = await db.queryParam_Parse(insertCommentQuery, [createdTime, content, image, episodeIdx, 1, webtoonIdx]);
        if (!insertCommentResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.COMMENT_INSERT_FAIL));
        } else { 
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.COMMENT_INSERT_SUCCESS));
        }
    }
});

module.exports = router;