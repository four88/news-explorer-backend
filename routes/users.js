const router = require('express').Router();

const {
  getUserInfo,
} = require('../controllers/users');

// assign routes
// get info user
router.get('/me', getUserInfo);

module.exports = router;
