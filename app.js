const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
const { celebrate, Joi, errors } = require('celebrate');
const { createUser, login } = require('./controllers/users');
const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/articles');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundError');

const app = express();
// allow another service point
const allowedCors = [
  'localhost:3000',
];

// set up and connect to DB
const dbUri = 'mongodb://0.0.0.0:27017/newsExplorerDB';
const dbConfig = {
  useNewUrlParser: true,
};
mongoose.Promise = global.Promise;
// connect DB
mongoose.connect(dbUri, dbConfig)
  .then(
    () => {
      console.log('DB connected');
    },
    (err) => {
      console.log(`cannot connect to DB: ${err}`);
    },
  );

// logger requestLogger
app.use(requestLogger);

// use helment for security
app.use(helmet());

// use body-parser for work with http data transfer
// especially json format
app.use(bodyParser.json(), cors());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// middleware for allow a cors
app.use((req, res, next) => {
  const { origin } = req.headers; // assign the corresponding header to the origin variable

  if (allowedCors.includes(origin)) { // check that the origin value is among the allowed domains
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.options('*', cors());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

/// / routes signup and signin
// signup
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);
// signin
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

// authentication required JWT for pass to these routes
app.use(auth);
app.use('/user', userRoutes);
app.use('/article', articleRoutes);

// for random route not includes in this project
app.get('*', () => {
  throw new NotFoundError('Request resource not found');
});

// logger
app.use(errorLogger);

app.use(errors());
// for Non-exestent address
app.use((err, req, res, next) => {
  res
    .status(err.statusCode ? err.statusCode : 500)
    .send({
      message: err.message ? err.message : 'An error occurred on the server',
    });
});

// connect port
app.listen(PORT, () => {
  console.log(`Connect to port ${PORT}`);
});
