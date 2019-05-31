var express = require('express');
var router = express.Router();

router.use('/user', require('./user/userRouter'));
router.use('/webtoon', require('./webtoon/index'));
router.use('/main', require('./main/mainRouter'));
router.use('/comment', require('./comment/commentRouter'));

module.exports = router;
