const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');
const ForbiddenError = require('../errors/forbiddenError');

const { NODE_ENV, JWT_SECRET } = process.env;

// for checking authorization token from frontend
// Have user has token or not ?
const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new ForbiddenError('authorization required'));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new UnauthorizedError('authorization required'));
  }

  req.user = payload; // adding the payload to the Request object

  return next(); // passing the request further along
};
