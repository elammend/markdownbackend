const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const lodash = require('lodash');
const latex = require('node-latex');
const fs = require('fs');
const AWS = require('aws-sdk');
const { join } = require('path');
const sys = require('sys');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

AWS.config.update({ region: 'us-west-2' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const bucketParams = {
  Bucket: 'elasticbeanstalk-us-east-2-757174149823'
};

// Call S3 to obtain a list of the objects in the bucket
const uploadFile = fileName => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName, // File name you want to save as in S3
    Body: fileContent,
    ContentType: 'application/pdf',
    ACL: 'public-read'
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};
exports.compile = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  let objectURL =
    'https://elasticbeanstalk-us-east-2-757174149823.s3.us-east-2.amazonaws.com/sampleReactPdf.pdf';

  let resError = '';
  console.log('started compiling!');
  const LaTeXText = req.body.text;

  const pdfList = (await s3.listObjects(bucketParams).promise()).Contents;
  const pickedFile = lodash.filter(
    pdfList,
    obj => obj.Key === 'sampleReactPdf.pdf'
  )[0].Key;
  console.log(pickedFile);
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

  fs.writeFileSync(decoded.id + '.tex', LaTeXText, err => {
    // throws an error, you could also catch it here
    if (err) throw err;
    console.log('LaTeX text saved!');
    // success case, the file was saved
  });

  const execSync = require('child_process').execSync;

  const code = execSync(
    'pwd\nexport PATH="$PATH:/usr/local/texlive/2020/bin/x86_64-darwin"',
    {
      stdio: 'inherit'
    }
  );
  const input = fs.createReadStream(decoded.id + '.tex');
  const output = fs.createWriteStream(decoded.id + '.pdf');
  const pdf = latex(input);
  pdf.pipe(output);
  pdf.on('error', err => {
    console.log('commited syntax error');
    console.error(err);
    this.resError = 'syntax error';
    res.status(201).json({
      status: 'success',
      data: {
        message: objectURL,
        errorMessage: this.resError
      }
    });
  });
  pdf.on('finish', () => {
    console.log('PDF generated!');
    uploadFile(decoded.id + '.pdf');
    objectURL =
      'http://localhost:3000/api/v1/documents?id=' +
      decoded.id +
      '&time=' +
      Date.now();
    res.status(201).json({
      status: 'success',
      data: {
        message: objectURL
      }
    });
  });
});