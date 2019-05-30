var express = require('express');
var router = express.Router();
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
require('dotenv').config();

router.get('/image', async(req, res) => {
    const mainPage = [];
    mainPage.push(process.env.MAIN_PAGE1);
    mainPage.push(process.env.MAIN_PAGE2);
    mainPage.push(process.env.MAIN_PAGE3);

    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MAIN_PAGE_SELECT_SUCCESS, mainPage));
})

module.exports = router;