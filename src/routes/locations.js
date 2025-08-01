const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

// GET /api/v1/locations/search?keyword={keyword} - 위치 검색
router.get('/search', onboardingController.searchLocations);

module.exports = router;
