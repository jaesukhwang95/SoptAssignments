var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');



router.post('/', upload.single('thumbnail'), async(req, res) => {
    const title = req.body.title;
    const category = req.body.category;
    if(!title || !req.file || !category)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const thumbnail = req.file.location;
        const insertWebtoonQuery = 'INSERT INTO webtoon (webtoonName, likeCount, thumbnail, writer, category) VALUES (?, ?, ?, ?, ?)';
        const insertWebtoonResult = await db.queryParam_Parse(insertWebtoonQuery, [title, 0, thumbnail, 1, category]);
        if (!insertWebtoonResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.WEBTOON_INSERT_FAIL));
        } else { 
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.WEBTOON_INSERT_SUCCESS));
        }
    }
});


module.exports = router;