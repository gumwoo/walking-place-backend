const express = require('express');
const router = express.Router();
//const markingPhotoController = require('../controllers/markingPhotoController');
//const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
/*
// POST /api/v1/marking-photos - 마킹 사진 업로드
router.post('/', 
  //authMiddleware.verifyToken, 
  uploadMiddleware.single('image'), 
  //markingPhotoController.uploadMarkingPhoto
);
*/

module.exports = router;
