var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const upload = require('../../../config/multer');
const moment = require('moment');


router.get('/', async(req, res) => {
    const getAllNewsQuery = 'SELECT * FROM news ORDER BY writetime DESC';
    const getAllNewsResult = await db.queryParam_None(getAllNewsQuery);
    if (!getAllNewsResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.NEWS_SELECT_FAIL));
    } else {    
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NEWS_SELECT_SUCCESS, getAllNewsResult));
    }
})

router.get('/:idx', async(req, res) => {
    const dataFilter = (rawData) => {
        FilteredData = {
                "contentIdx": rawData.contentIdx,
                "title" : rawData.title,
                "content": rawData.content,
                "contentImg": rawData.contentImg,
                "writetime": rawData.writetime,
        }
        return FilteredData;
    }
    const getAllContentsQuery = 'SELECT * FROM contents LEFT JOIN news ON news.newsIdx = contents.newsIdx WHERE contents.newsIdx = ?';
    const getAllContentsResult = await db.queryParam_Parse(getAllContentsQuery, [req.params.idx] );
    let contentsArr = []
    getAllContentsResult.forEach((rawContents, index, result) => {
        contentsArr.push(dataFilter(rawContents));
    });
    if (!getAllContentsResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.CONTENTS_SELECT_FAIL));
    } else if(getAllContentsResult.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }
    else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.CONTENTS_SELECT_SUCCESS, contentsArr));
    }
})


/*
    POST의 예시

    METHOD : POST
    body : {
        "title": "제목1",
        "writer": "작성자1",
        "contentImgs": "파일 4개",
        "contents": "내용1,내용2,내용3"
    }
    contentImgs의 경우 첫 번 째 파일을 썸네일로 사용하였고 나머지 파일들을 컨텐츠 이미지로 사용했습니다.
    contents의 경우 ,를 기준으로 파싱을 하여 배열에 집어넣었습니다. 갯수는 contentImgs보다 1개 작아야 합니다.
*/

router.post('/', upload.array('contentImgs'), async(req, res) => {
    const writer = req.body.writer;
    const title = req.body.title;
    const contentImgs = req.files;
    const contents = req.body.contents;
    const writetime = moment().format('YYYY-MM-DD hh:mm:ss');
    const insertNewsQuery = 'INSERT INTO news (writer, title, thumnail, writetime) VALUES (?, ?, ?, ?)';
    const insertContentsQuery = 'INSERT INTO contents (content, contentImg, newsIdx) VALUES (?, ?, ?)';

    if(contentImgs.length==0 || !contents || !title || !writer)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else {
        const thumnail = contentImgs[0].location;
        const parsedContents = req.body.contents.split(",");
        if(parsedContents.length != contentImgs.length-1)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        }
        else{
            const insertTransaction = await db.Transaction(async(connection) => {
                const insertNewsResult = await connection.query(insertNewsQuery, [writer, title, thumnail, writetime]);
                newsIdx = insertNewsResult.insertId
                for(i=1; i<contentImgs.length ;i++)
                {
                    const insertContentsResult = await connection.query(insertContentsQuery, [parsedContents[i-1], contentImgs[i].location, newsIdx]);
                }   
            });
            if (!insertTransaction) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.NEWS_TRANSAC_FAIL));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NEWS_TRANSAC_SUCCESS));
            }
        }
    }
});

module.exports = router;