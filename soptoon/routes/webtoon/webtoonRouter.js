var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

router.get('/:category', async(req, res) => {
    const webtoonsFilter = (rawData) => {
        Filteredwebtoons = {
            "webtoonIdx": rawData.webtoonIdx,
            "webtoonName": rawData.webtoonName,
            "thumbnail": rawData.thumbnail,
            "userName": rawData.userName,
            "likeCount": rawData.likeCount
        }
        return Filteredwebtoons;
    }
    const getWebtoonWithSameCategoryQuery  = 'SELECT * FROM webtoon LEFT JOIN user ON user.userIdx = webtoon.userIdx WHERE webtoon.category = ?';
    const categorizedWebtoons = await db.queryParam_Parse(getWebtoonWithSameCategoryQuery, [req.params.category] );
    console.log(categorizedWebtoons)
    let webtoonsArr = []
    categorizedWebtoons.forEach((rawContents) => {
        webtoonsArr.push(webtoonsFilter(rawContents));
    });
    if (!categorizedWebtoons) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.WEBTOON_SELECT_FAIL));
    } else if(categorizedWebtoons.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }
    else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.WEBTOON_SELECT_SUCCESS, webtoonsArr   ));
    }    
})

router.post('/', upload.single('thumbnail'), async(req, res) => {
    const title = req.body.title;
    const category = req.body.category;
    const userIdx = req.body.userIdx;   
    if(!title || !req.file || !category)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const thumbnail = req.file.location;
        const insertWebtoonQuery = 'INSERT INTO webtoon (webtoonName, likeCount, thumbnail, userIdx, category) VALUES (?, ?, ?, ?, ?)';
        const insertWebtoonResult = await db.queryParam_Parse(insertWebtoonQuery, [title, 0, thumbnail, userIdx, category]);
        if (!insertWebtoonResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.WEBTOON_INSERT_FAIL));
        } else { 
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.WEBTOON_INSERT_SUCCESS));
        }
    }
});


module.exports = router;