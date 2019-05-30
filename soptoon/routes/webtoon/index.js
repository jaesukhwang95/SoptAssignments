var express = require('express');
var router = express.Router();

router.use('/episode', require('./episodeRouter'));
router.use('/', require('./webtoonRouter'));

module.exports = router;