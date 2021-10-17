var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',controller.getAllOrderItems);
router.get('/:orderNum',controller.getOrderItemsByOrderNum);
router.post('/pull',controller.pullAllOrderItems);

module.exports = router;