const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createUser, login } = require('../controllers/users');
const userRoutes = require('./users');
const articleRoutes = require('./articles');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/notFoundError');

/// / routes signup and signin
// signup
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);
// signin
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

// authentication required JWT for pass to these routes
router.use(auth);
router.use('/user', userRoutes);
router.use('/article', articleRoutes);

// for random route not includes in this project
router.get('*', () => {
  throw new NotFoundError('Request resource not found');
});

module.exports = { router };
