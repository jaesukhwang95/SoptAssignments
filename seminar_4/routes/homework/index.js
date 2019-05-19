var express = require('express');
var router = express.Router();

router.use('/board', require('./board/boardRouter'));
router.use('/signup', require('./signup/signupRouter'));
router.use('/signin', require('./signin/signinRouter'));


module.exports = router;