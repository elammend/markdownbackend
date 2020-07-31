const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//const bodyParser = require('body-parser').json();
const cors = require('cors');
const AppError = require('./utils/appError');
// const globalErrorHandler = require('./controllers/errorController'); TODO
const userRouter = require('./routes/userRoutes');
const docRouter = require('./routes/docRoutes');
const compileRouter = require('./routes/compileRoutes');
const emailRouter = require('./routes/emailRoutes');
//const { compile } = require('morgan');

const app = express();
//use cors to give people access
//'https://edward-latex-react-frontend.herokuapp.com'
app.use(
  cors({
    origin: 'https://markdown-frontend.herokuapp.com',
    credentials: true
  })
);
app.use(cors());
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());
//app.use(bodyParser);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp()); // TODO look up whitelist function

// 3) ROUTES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/compile', compileRouter);
app.use('/api/v1/email', emailRouter);
app.use('/api/v1/documents', docRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.use(globalErrorHandler); TODO

module.exports = app;
