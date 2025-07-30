const express = require('express');
const router = express.Router();
const markingPhotoController = require('../controllers/markingPhotoController');
const { authenticateJWT } = require('../middlewares/auth');

// POST /api/v1/marking-photos - 새로운 마킹 포인트 등록
router.post('/', 
  authenticateJWT, 
  markingPhotoController.createMarkingPoint
);

module.exports = router;
