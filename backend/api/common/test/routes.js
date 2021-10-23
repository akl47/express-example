var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');
const bodyValidator = require('../../../middleware/bodyValidator.js');

// router.get('/', controller.getAll);
router.post('/', bodyValidator,controller.create);

module.exports = router;