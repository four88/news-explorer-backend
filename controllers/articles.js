const mongoose = require('mongoose');
const Articles = require('../models/articles');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const { SUCCESS_CODE } = require('../utils/constant');

// create article
// eslint-disable-next-line
module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = req.user._id;
  Articles.create({
    link, keyword, title, text, date, source, image, owner,
  })
    .then((article) => res.status(SUCCESS_CODE).send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid input of article'));
      } else {
        // eslint-disable-next-line
        next(err);
      }
    });
};

// delete article
module.exports.deleteArticle = (req, res, next) => {
  const id = req.params.articleId;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Not found this article Id');
  }

  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    throw new NotFoundError('Not found this user Id');
  }

  Articles.findById(id).select('+owner')
    .then((article) => {
      if (!article) {
        throw new NotFoundError('Could not find a article with that id');
      }
      if (article.owner.toString() === req.user._id) {
        Articles.findByIdAndRemove(id, () => {
          res.status(SUCCESS_CODE).send({ message: 'article deleted' });
        });
      } else if (id === undefined) {
        throw new NotFoundError('Could not find a article with that id');
      } else {
        throw new ForbiddenError('Authorization required for this action');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // eslint-disable-next-line
        next(new BadRequestError('Invalid article or user Id'));
      }
    });
};
