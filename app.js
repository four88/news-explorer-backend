const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const { PORT = 3000, BASE_URL } = process.env;

const app = express();


// set up and connect to DB 
const dbUri = 'mongodb://0.0.0.0:27017/newsExplorerDB';
const dbConfig = {
  useNewUrlParser: true,
};
// connect DB
mongoose.connect(dbUri, dbConfig)
  .then(() => {
    console.log('DB connected')
  },
    (err) => {
      console.log(`cannot connect to DB: ${err}`)
    })


// use helment for security
app.use(helmet());

// use body-parser for work with http data transfer
// especially json format
app.use(bodyParser.json(), cors());
app.use(bodyParser.urlencoded({
  extended: true
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


// connect port 
app.listen(PORT, () => {
  console.log(`Connect to port ${PORT}`)
});
