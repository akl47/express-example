var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',controller.getAllOrders);
router.get('/user/:userID',controller.getOrdersByUserID);
router.post('/pull',controller.pullAllOrders);

module.exports = router;