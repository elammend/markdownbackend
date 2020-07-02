const express = require('express');
const docController = require('./../controllers/docController');

const router = express.Router();
router.route('/').get(docController.getLastDoc);

module.exports = router;
