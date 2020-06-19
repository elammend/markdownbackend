const express = require('express');
const itemController = require('../controllers/itemController');
// const authController = require('./../controllers/authController'); TODO
// const reviewRouter = require('./../routes/reviewRoutes'); TODO

const router = express.Router();

//meant for nested routes

//router.use('/:itemId/reviews', reviewRouter); TODO

router.route('/item-stats').get(itemController.getItemStats);

router
  .route('/')
  .get(itemController.getAllItems)
  .post(
    authController.protect,
    itemController.createItem);

