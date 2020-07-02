const express = require('express');
const compileController = require('./../controllers/compileController');

const router = express.Router();

//router.use(authController.protect);
console.log('passing');
router.route('/').post(compileController.compile);

module.exports = router;
