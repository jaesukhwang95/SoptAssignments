var express = require('express');
var router = express.Router();

router.use('/news', require('./news/newsRouter'));


module.exports = router;