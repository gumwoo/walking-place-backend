const express = require('express');
const router = express.Router();
const markingPhotoController = require('../controllers/markingPhotoController');
const { authenticateJWT } = require('../middlewares/auth');

// GET /api/v1/marking-photozones/{photozoneId} - 마킹 포토존 상세 정보 조회
router.get('/:photozoneId', 
  authenticateJWT, 
  markingPhotoController.getPhotozoneDetails
);

// POST /api/v1/marking-photozones/{photozoneId}/photos - 기존 포토존에 사진 추가
router.post('/:photozoneId/photos', 
  authenticateJWT, 
  markingPhotoController.addPhotoToPhotozone
);

module.exports = router;
