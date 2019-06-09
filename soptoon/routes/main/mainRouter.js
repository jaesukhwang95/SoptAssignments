var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const MAIN_PAGE = require('../../config/mainPage')

router.get('/image', async(req, res) => {
    const mainPage = [];
    mainPage.push(MAIN_PAGE.MAIN_PAGE1);
    mainPage.push(MAIN_PAGE.MAIN_PAGE2);
    mainPage.push(MAIN_PAGE.MAIN_PAGE3);

    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MAIN_PAGE_SELECT_SUCCESS, mainPage));
})

module.exports = router;