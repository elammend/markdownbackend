const express = require('express');
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');
// const reviewRouter = require('./../routes/reviewRoutes'); TODO

const router = express.Router();

//meant for nested routes

//router.use('/:itemId/reviews', reviewRouter); TODO

router.route('/item-stats').get(itemController.getItemStats);

router
  .route('/')
  .get(itemController.getAllItems)
  .post(authController.protect, itemController.createItem);

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    itemController.updateItem
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    itemController.deleteItem
  );

module.exports = router;
