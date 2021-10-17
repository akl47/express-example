var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.post('/print/:id',checkToken,controller.printBarcode);
router.get('/',checkToken,controller.getAllBarcodes);
router.get('/display/:id',checkToken,controller.displayBarcode);
router.get('/tag/:id',checkToken,controller.getTagByID);
router.get('/tag/',checkToken,controller.getAllTags);
router.get('/category',checkToken,controller.getBarcodeCategories);
router.delete('/:id',checkToken,controller.deleteBarcodeByID);

module.exports = router;