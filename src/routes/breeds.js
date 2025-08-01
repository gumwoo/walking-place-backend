const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

// GET /api/v1/breeds/search?keyword={keyword} - 견종 검색
router.get('/search', onboardingController.searchBreeds);

module.exports = router;
