const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/v1/users/me/terms - 사용자 약관 동의 상태 저장
router.post('/me/terms', authMiddleware.verifyToken, userController.agreeToTerms);

// PUT /api/v1/users/me/profile - 사용자 프로필 업데이트 (위치/반려동물 정보)
router.put('/me/profile', authMiddleware.verifyToken, userController.updateProfile);

// GET /api/v1/users/me/summary-profile - 대표 반려동물 이름 및 아이콘 정보 조회
router.get('/me/summary-profile', authMiddleware.verifyToken, userController.getSummaryProfile);

// GET /api/v1/users/me/profile - 사용자 및 반려동물 프로필 정보 조회 (마이 프로필/프로필 편집)
router.get('/me/profile', authMiddleware.verifyToken, userController.getProfile);

// GET /api/v1/users/me/walk-records - 사용자의 모든 산책 기록 목록 조회
router.get('/me/walk-records', authMiddleware.verifyToken, userController.getWalkRecords);

module.exports = router;
