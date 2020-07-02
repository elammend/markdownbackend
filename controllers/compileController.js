const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const fs = require('fs');
const pdf = require('html-pdf');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.compile = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  let objectURL =
    'https://elasticbeanstalk-us-east-2-757174149823.s3.us-east-2.amazonaws.com/sampleReactPdf.pdf';

  console.log('started compiling!');
  const htmlText = req.body.text;

  const bearerText = req.headers.authorization;
  const token = bearerText.split(' ')[1];
  console.error(token);
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3) Check if user still exists
  if (!decoded) {
    res.status(401).json({
      status: 'fail',
      data: {
        message: 'log in to compile'
      }
    });
  }
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  fs.writeFileSync(`${decoded.id}.html`, htmlText, err => {
    // throws an error, you could also catch it here
    if (err) throw err;
    console.log('html text saved!');
    // success case, the file was saved
  });

  const html = fs.readFileSync(`${decoded.id}.html`, 'utf8');
  const options = { format: 'Letter' };

  pdf.create(html, options).toFile(`${decoded.id}.pdf`, function(err, resp) {
    if (err) {
      console.log(err);
      resp.status(201).json({
        status: 'success',
        data: {
          message: objectURL,
          errorMessage: this.resError
        }
      });
    }
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });

  res.status(201).json({
    status: 'success',
    data: {
      message: objectURL
    }
  });
});
