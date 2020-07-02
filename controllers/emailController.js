const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Call S3 to obtain a list of the objects in the bucket
exports.email = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  let resError = '';
  console.log('started emailing!');

  const bearerText = req.headers.authorization;
  const token = bearerText.split(' ')[1];

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded);
  // 3) Check if user still exists
  if (!decoded) {
    res.status(401).json({
      status: 'fail',
      data: {
        message: 'log in to email to yourself'
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

  console.log('yoyo');

  const userDoc = await User.findById(decoded.id);
  console.log(userDoc.email);

  const sgMail = require('@sendgrid/mail');
  console.error('got to error');

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const pathToAttachment = `${decoded.id}.pdf`;
  const attachment = fs.readFileSync(pathToAttachment).toString('base64');

  const msg = {
    to: userDoc.email,
    from: 'eddy.lam97@gmail.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    attachments: [
      {
        content: attachment,
        filename: 'attachment.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  try {
    sgMail.send(msg);
  } catch (e) {
    console.error(e);
  }
  res.status(201).json({
    status: 'success',
    data: {
      message: 'email sent!',
      errorMessage: this.resError
    }
  });
});
