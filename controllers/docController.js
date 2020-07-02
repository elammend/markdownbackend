const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Call S3 to obtain a list of the objects in the bucket
exports.getLastDoc = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  console.log('preparing doc ');
  const file = fs.createReadStream(req.query['id'] + '.pdf');
  const stat = fs.statSync(req.query['id'] + '.pdf');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'applicatin/pdf');
  res.setHeader('Content-Disposition', 'inline');
  file.pipe(res);
});
