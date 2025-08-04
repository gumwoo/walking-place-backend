const express = require('express');
const router = express.Router();
const markingPhotoController = require('../controllers/markingPhotoController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/v1/marking-photos - 새로운 마킹 포인트 등록 (마킹 버튼을 통한 첫 사진)
router.post('/', 
  authenticateToken, 
  markingPhotoController.createMarkingPoint
);

// GET /api/v1/marking-photozones/{photozoneId} - 마킹 포토존 상세 정보 조회
router.get('/:photozoneId', 
  authenticateToken, 
  markingPhotoController.getPhotozoneDetails
);

// POST /api/v1/marking-photozones/{photozoneId}/photos - 기존 포토존에 사진 추가
router.post('/:photozoneId/photos', 
  authenticateToken, 
  markingPhotoController.addPhotoToPhotozone
);

module.exports = router;
