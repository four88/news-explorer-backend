const mongoose = require('mongoose');
const validator = require('validator');

const articleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, 'The article must contain keyword'],
  },

  title: {
    type: String,
    required: [true, 'The article must contain title '],
  },

  text: {
    type: String,
    required: [true, 'The article must contain text'],
  },

  date: {
    type: String,
    required: [true, 'The article must contain date'],
  },

  source: {
    type: String,
    required: [true, 'The article must contain source'],
  },

  link: {
    type: String,
    required: [true, 'The article must contain link URL'],
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Wrong link URL format',
    },
  },

  image: {
    type: String,
    required: [true, 'The article must contain image URL'],
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Wrong image URL format',
    },
  },

  owner: {
    type: mongoose.Types.ObjectId,
    required: [true, 'The article must contain owener id for save'],
    ref: 'user',
    select: false,
  },
});

module.exports = mongoose.model('article', articleSchema);
