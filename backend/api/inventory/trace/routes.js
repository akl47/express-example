var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');
const bodyValidator = require('../../../middleware/bodyValidator');

router.get('/:id',checkToken,controller.getTraceByID);
router.post('/',[checkToken,bodyValidator.trace],controller.createNewTrace);
router.put('/:id',[checkToken,bodyValidator.trace],controller.updateTrace);

module.exports = router;