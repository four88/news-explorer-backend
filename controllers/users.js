const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const { NODE_ENV, JWT_SECRET } = process.env;
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const UnauthorizedError = require('../errors/unauthorizedError');
const ConflictError = require('../errors/conflictError');
const { SUCCESS_CODE } = require('../utils/constant');

// get the user data
// esplint-disable-next-line
module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      new NotFoundError('User ID not found');
    })
    .then((user) => res.status(SUCCESS_CODE).send({ data: user }))
    .catch(next);
};

// create user
// eslint-disable-next-line
module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      name,
      email,
      password: hash,
    })
      .then((user) => res.status(SUCCESS_CODE).send({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          // eslint-disable-next-line
          next(new BadRequestError("Missing or Invalid email or password"));
        }
        if (err.name === 'MongoServerError') {
          // eslint-disable-next-line
          next(new ConflictError("This email is already exits"));
        } else {
          // eslint-disable-next-line
          next(err);
        }
      });
  });
};

// login
// eslint-disable-next-line
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      res.status(SUCCESS_CODE).send({
        token: jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '7d' },
        ),
        name: user.name,
        email: user.email,
      });
    })
    .catch(() => {
      // eslint-disable-next-line
      next(new UnauthorizedError("Incorrect email or password"));
    });
};
