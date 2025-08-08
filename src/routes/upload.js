const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// POST /api/v1/upload/presigned-url - S3 업로드용 Presigned URL 생성
router.post('/presigned-url', uploadController.generatePresignedUrl);

module.exports = router;