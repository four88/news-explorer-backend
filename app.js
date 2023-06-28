const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const { router } = require('./routes/index');

dotenv.config();
const { NODE_ENV, DB_URI } = process.env;
const { PORT = 3000 } = process.env;

const app = express();
// allow another service point
const allowedCors = [
  'https://news-project.students.nomoredomainssbs.ru',
  'https://www.news-project.students.nomoredomainssbs.ru',
  'http://localhost:3000',
  'https://649ab4fcce5a766433de0fb7--euphonious-twilight-07d568.netlify.app',
];

// set up and connect to DB
const dbConfig = {
  useNewUrlParser: true,
};
mongoose.Promise = global.Promise;
// connect DB
//

mongoose.connect(NODE_ENV === 'production' ? DB_URI : DB_URI, dbConfig).then(
  () => {
    console.log('DB connected');
  },
  (err) => {
    console.log(`cannot connect to DB: ${err}`);
  },
);

// use helment for security
app.use(helmet());

// logger requestLogger
app.use(requestLogger);

// use body-parser for work with http data transfer
// especially json format
app.use(bodyParser.json(), cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// middleware for allow a cors
// app.use((req, res, next) => {
//   const { origin } = req.headers; // assign the corresponding header to the origin variable
//
//   if (allowedCors.includes(origin)) {
//     // check that the origin value is among the allowed domains
//     res.header('Access-Control-Allow-Origin', origin);
//   }
//   next();
// });
//
// app.options('*', cors());

const corsOptions = {
  origin(origin, callback) {
    if (allowedCors.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

// routes
app.use(router);

// logger
app.use(errorLogger);

app.use(errors());
// for Non-exestent address
app.use((err, req, res, next) => {
  res.status(err.statusCode ? err.statusCode : 500).send({
    message: err.message ? err.message : 'An error occurred on the server',
  });
});

// connect port
app.listen(PORT, () => {
  console.log(`Connect to port ${PORT}`);
});
