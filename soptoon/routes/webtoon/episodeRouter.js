var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');
const upload = require('../../config/multer');
const moment = require('moment');

router.get('/:webtoonIdx', async(req, res) => {
    const getEpisodeWithSameWebtoonIdxQuery = 'SELECT * FROM episode LEFT JOIN webtoon ON episode.webtoonIdx = webtoon.webtoonIdx WHERE episode.webtoonIdx = ?';
    const episodes = await db.queryParam_Parse(getEpisodeWithSameWebtoonIdxQuery, [req.params.webtoonIdx] );
    if (episodes.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.EPISODE_SELECT_FAIL));
    } else {
        console.log(episodes)
        const episodeFilter = (rawData) => {
            FilteredEpisodes = {
                "webtoonIdx": rawData.webtoonIdx,
                "episodeIdx": rawData.episodeIdx,
                "webtoonName": rawData.webtoonName,
                "title": rawData.title,
                "views": rawData.views,
                "createdTime": rawData.createdTime,
                "thumbnail": rawData.thumbnail
            }
            return FilteredEpisodes;
        }
        let episodesArr = []
        episodes.forEach((rawEpisode) => {
        episodesArr.push(episodeFilter(rawEpisode));
    });
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EPISODE_SELECT_SUCCESS, (episodesArr)));
    }
})

router.get('/detail/:webtoonIdx/:episodeIdx', async(req, res) => {
    console.log(req.params.webtoonIdx);
    console.log(req.params.episodeIdx);
    const getEpisodeWithSameWebtoonIdxQuery = 'SELECT * FROM episode LEFT JOIN webtoon ON episode.webtoonIdx = webtoon.webtoonIdx WHERE episode.webtoonIdx = ? AND episode.episodeIdx = ?';
    const episodes = await db.queryParam_Parse(getEpisodeWithSameWebtoonIdxQuery, [req.params.webtoonIdx, req.params.episodeIdx] );
    if (episodes.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.EPISODE_SELECT_FAIL));
    } else {
        console.log(episodes)
        const episodeFilter = (rawData) => {
            FilteredEpisodes = {
                "webtoonName": rawData.webtoonName,
                "detail": rawData.detail,
            }
            return FilteredEpisodes;
        }
        let episodesArr = []
        episodes.forEach((rawEpisode) => {
        episodesArr.push(episodeFilter(rawEpisode));
    });
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EPISODE_SELECT_SUCCESS, (episodesArr)));
    }
})


router.post('/', upload.array('contentImgs'), async(req, res) => {
    const title = req.body.title;
    const webtoonIdx = req.body.webtoonIdx;
    const createdTime = moment().format('YYYY-MM-DD hh:mm:ss');
    const contentImgs = req.files;
    console.log(req.files)
    if(!title || !webtoonIdx || contentImgs.length <= 1)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const thumbnail = contentImgs[0].location;
        const detail = contentImgs[1].location;
        const insertEpisodeQuery = 'INSERT INTO episode (webtoonIdx, title, views, createdTime, thumbnail, detail, commentsCount) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const insertEpisodeResult = await db.queryParam_Parse(insertEpisodeQuery, [webtoonIdx, title, 0, createdTime, thumbnail, detail, 0]);
        if (!insertEpisodeResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.EPISODE_INSERT_FAIL));
        } else { 
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EPISODE_INSERT_SUCCESS));
        }
    }
});

module.exports = router;
