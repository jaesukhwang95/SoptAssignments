var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const crypto = require('crypto-promise');
const boardData = require('../../../module/utils/boardData');

function js_yyyy_mm_dd_hh_mm_ss () {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

router.get('/', async(req, res) => {
    const getAllBoardQuery = 'SELECT * FROM board';
    const getAllBoardResult = await db.queryParam_None(getAllBoardQuery);
    let boardArr = []
    getAllBoardResult.forEach((rawBoard, index, result) => {
        boardArr.push(boardData(rawBoard));
    });
    if (!getAllBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, boardArr));
    }
});

router.get('/:id', async(req, res) => {
    const getBoardWithSameIdQuery = 'SELECT * FROM board WHERE boardIdx = ?';
    const resultBoard = await db.queryParam_Parse(getBoardWithSameIdQuery, [req.params.id] );
    if (resultBoard.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
    } else {
        const board = boardData(resultBoard[0]);
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, board));
    }
})

router.post('/', async(req, res) => {
    if(!req.body.title || !req.body.content || !req.body.boardPw)
    {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }
    else{
        const salt = await crypto.randomBytes(32);
        const boardPw = await crypto.pbkdf2(req.body.boardPw, salt.toString('base64'), 1000, 32, 'SHA512');
        const insertBoardQuery = 'INSERT INTO board (title, content, boardPw, salt, writer, writetime) VALUES (?, ?, ?, ?, ?, ?)';
        const insertBoardResult = await db.queryParam_Parse(insertBoardQuery, [req.body.title, req.body.content, boardPw.toString('base64'), salt.toString('base64'), req.body.writer, js_yyyy_mm_dd_hh_mm_ss()]);
        if (!insertBoardResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_INSERT_FAIL));
        } else { 
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_INSERT_SUCCESS));
        }
    }
})

router.put('/', async(req, res) => {
    const getBoardWithSameIdQuery = 'SELECT * FROM board WHERE boardIdx = ?';
    const resultBoard = await db.queryParam_Parse(getBoardWithSameIdQuery, [req.body.boardIdx] );
    console.log(resultBoard)
    if (resultBoard.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
    } else {
        if(!req.body.boardPw)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.INCORRECT_PASSWORD));
        }
        else
        {
            const password = await crypto.pbkdf2(req.body.boardPw, resultBoard[0].salt, 1000, 32, 'SHA512');
            if(password.toString('base64') != resultBoard[0].boardPw)
            {
                res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.INCORRECT_PASSWORD));
            }
            else
            {
                (req.body.title) ? title = req.body.title : title = resultBoard[0].title;
                (req.body.content) ? content = req.body.content : content = resultBoard[0].content;
                const updateBoardQuery = 'UPDATE board SET title = ?, content = ?, writetime = ? WHERE boardIdx = ?';
                const updateBoardResult = await db.queryParam_Parse(updateBoardQuery, [title, content, js_yyyy_mm_dd_hh_mm_ss(), req.body.boardIdx]);
                console.log(updateBoardResult)
                if (!updateBoardResult) {
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_UPDATE_FAIL));
                } else { 
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_UPDATE_SUCCESS))
                }
            }
        }
    }
})

router.delete('/', async(req, res) => {
    const getBoardWithSameIdQuery = 'SELECT * FROM board WHERE boardIdx = ?';
    const resultBoard = await db.queryParam_Parse(getBoardWithSameIdQuery, [req.body.boardIdx] );
    if (resultBoard.length == 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
    } else {
        const password = await crypto.pbkdf2(req.body.boardPw, resultBoard[0].salt, 1000, 32, 'SHA512');
        if(password.toString('base64') != resultBoard[0].boardPw)
        {
            res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.INCORRECT_PASSWORD));
        }
        else
        {
            const deleteBoardQuery = 'DELETE FROM board WHERE boardIdx = ?';
            const deleteBoardResult = await db.queryParam_Parse(deleteBoardQuery, [req.body.boardIdx]);
            console.log(deleteBoardResult)
            if (!deleteBoardResult) {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_DELETE_FAIL))
            } else { 
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_DELETE_SUCCESS));
            }
        }
    }
})

module.exports = router;