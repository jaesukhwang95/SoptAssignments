var express = require('express');
var router = express.Router();

router.use('/user', require('./user/userRouter'));

module.exports = router;
