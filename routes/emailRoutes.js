const express = require('express');
const emailController = require('./../controllers/emailController');

const router = express.Router();

//router.use(authController.protect);
console.log('passing');
router.route('/').post(emailController.email);

module.exports = router;
