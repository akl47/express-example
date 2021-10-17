var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/:id',checkToken,controller.getQueuedUpdatedByID);

module.exports = router;