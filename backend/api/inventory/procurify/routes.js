var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.post('/pull',controller.pullAllProcurifyData);
// router.post('/pull/latest',controller.pullLatestProcurifyData);

module.exports = router;