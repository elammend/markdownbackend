const fs = require('fs');
const catchAsync = require('../utils/catchAsync');

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
