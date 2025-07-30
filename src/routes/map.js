const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// GET /api/v1/map/areas?latitude={lat}&longitude={lon}&radius={r} - 지도 표시 및 주변 정보 조회
router.get('/areas', mapController.getMapAreas);

module.exports = router;
